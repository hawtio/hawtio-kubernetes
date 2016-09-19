/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var FABRIC8_PROJECT_JSON = "fabric8ProjectJson";
  export var environemntsConfigMapName = "fabric8-environments";

  var jenkinshiftServiceName = 'jenkinshift';

  function byId(thing) {
    return thing.id;
  }

  function createKey(namespace, id, kind) {
    return (namespace || "") + "-" + (kind || 'undefined').toLowerCase() + '-' + (id || 'undefined').replace(/\./g, '-');
  }

  function populateKey(item, kind = "") {
    var result = item;
    var itemKind = getKind(item);
    if (kind && !itemKind) {
      item.kind = kind;
      itemKind = kind;
    }
    result['_key'] = createKey(getNamespace(item), getName(item), itemKind);
    return result;
  }

  function populateKeys(items:Array<any>, kind = "") {
    var result = [];
    angular.forEach(items, (item) => {
      result.push(populateKey(item, kind));
    });
    return result;
  }

  function selectPods(pods, namespace, labels) {
    return pods.filter((pod) => {
      return getNamespace(pod) === namespace && selectorMatches(labels, getLabels(pod));
    });
  }

  /**
   * The object which keeps track of all the pods, replication controllers, services and their associations
   */
  export class KubernetesModelService {
    public kubernetes = <KubernetesState> null;
    // public apps = [];
    public get apps() {
      return this.appViews;
    };
    public services = [];

    public replicationcontrollers = [];
    public get replicationControllers():Array<any> {
      return this.replicationcontrollers;
    }
    public set replicationControllers(replicationControllers:Array<any>) {
      this.replicationcontrollers = replicationControllers;
    }
    public pods = [];
    public hosts = [];
    public get namespaces():Array<string> {
      return this.kubernetes.namespaces;
    }
    public appViews = [];
    public appFolders = [];
    public replicasets = [];
    public replicas = [];
    public deployments = [];
    public deploymentconfigs = [];
    public allDeployments = [];

    public ingresses = [];
    public routes = [];
    public templates = [];
    public redraw = false;
    public resourceVersions = {};

    // various views on the data
    public deploymentsByKey = {};

    public podsByHost = {};
    public servicesByKey = {};
    public get replicationControllersByKey() {
      return this.replicasByKey;
    }
    public set replicationControllersByKey(val) {
      this.replicasByKey = val;
    }
    public replicasByKey = {};
    public podsByKey = {};

    // the environments by namespace (development project)
    public namespaceEnvironments = {};


    public get fetched():boolean {
      if (!this.watcher) {
        return false;
      }
      return this.watcher.fetched();
    };

    public isFetched(kind:string) {
      return this.watcher.fetched(kind);
    }

    public set fetched(val:boolean) {
      //ignore
    }
    public get showRunButton():boolean {
      return true;
    }

    public configmaps = [];
    public environments = [];
    public buildconfigs = [];
    public events = [];
    public workspaces = [];
    public projects = [];
    public project = null;
    public watcher:WatcherService = null;

    public get serviceApps():Array<any> {
      var answer = _.filter(this.services, (s) => {
        return s.$serviceUrl && s.$podCount
      });
      return answer;
    }

    public $keepPolling() {
      return keepPollingModel;
    }

    public orRedraw(flag) {
      this.redraw = this.redraw || flag;
    }

    public getService(namespace, id) {
      return this.servicesByKey[createKey(namespace, id, 'service')];
    }

    public getReplicationController(namespace, id) {
      var key1 = createKey(namespace, id, 'replicationController');
      var key2 = createKey(namespace, id, 'replicaSet');
      var answer = this.replicationControllersByKey[key1] || this.replicationControllersByKey[key2];
      if (!answer) {
        log.info("Could not find replica for either key `" + key1 + "` or `" + key2 + "`");
      }
      return answer;
    }

    public getNamespaceOrProject(name) {
      return getNamed(this.projects, name);
    }

    public getDeployment(namespace, id) {
      return this.deploymentsByKey[createKey(namespace, id, 'deployment')] || this.deploymentsByKey[createKey(namespace, id, 'deploymentconfig')] ;
    }

    public getPod(namespace, id) {
      return this.podsByKey[createKey(namespace, id, 'pod')];
    }

    public podsForNamespace(namespace = this.currentNamespace()) {
      return _.filter(this.pods, { namespace: namespace });
    }

    public getBuildConfig(name) {
      return _.find(this.buildconfigs, { $name: name });
    }

    // find an object by it's name of a given kind
    public findObject(kind, name) {
      var collection = this[kind];
      if (!collection) {
        return null;
      }
      return _.find(this[kind], (obj) => getName(obj) === name);
    }

    // search across all objects and return the ones with the given set of labels
    public objectsWithLabels(desiredLabels:any) {
      var matchFunc = _.matches(desiredLabels);
      var keys = this.watcher.getTypes();
      var answer = [];
      _.forEach(keys, (key) => {
        var objects = this[key];
        if (!objects || !objects.length) {
          return;
        }
        var matches = _.filter(objects, (obj) => {
          var labels = getLabels(obj);
          return matchFunc(labels);
        });
        if (matches.length) {
          answer = answer.concat(matches);
        }
      });
      return answer;
    }

    public getProject(name, ns = this.currentNamespace()) {
      var buildConfig = this.project;
      if (!buildConfig) {
        var text = localStorage[FABRIC8_PROJECT_JSON];
        if (text) {
          try {
            buildConfig = angular.fromJson(text);
          } catch (e) {
            log.warn("Could not parse json for " + FABRIC8_PROJECT_JSON + ". Was: " + text + ". " + e, e);
          }
        }
      }
      if (buildConfig && ns != getNamespace(buildConfig) && name != buildConfig.$name) {
        buildConfig = this.getBuildConfig(name);
      }
      return buildConfig;
    }


    public setProject(buildConfig) {
      this.project = buildConfig;
      if (buildConfig) {
        // lets store in local storage
        var localStorage = inject("localStorage");
        if (localStorage) {
          localStorage[FABRIC8_PROJECT_JSON] = angular.toJson(buildConfig);
        }
      }
    }

    /**
     * Returns the current selected namespace or the default namespace
     */
    public currentNamespace() {
      var answer = null;
      if (this.kubernetes) {
        answer = this.kubernetes.selectedNamespace;
      }
      return answer || defaultNamespace;
    }

    protected updateIconUrlAndAppInfo(entity, nameField: string) {
      var answer = null;
      var id = getName(entity);
      entity.$iconUrl = Core.pathGet(entity, ['metadata', 'annotations', 'fabric8.' + id + '/iconUrl']) || Core.pathGet(entity, ['metadata', 'annotations', 'fabric8.io/iconUrl']);
      entity.$info = Core.pathGet(entity, ['metadata', 'annotations', 'fabric8.' + id + '/summary']);
      if (entity.$iconUrl === "data:image/svg+xml;charset=UTF-8;base64,") {
        entity.$iconUrl = defaultIconUrl;
      }
      if (entity.$iconUrl) {
        return;
      }
      if (id && nameField) {
        (this.templates || []).forEach((template) => {
          var metadata = template.metadata;
          if (metadata) {
            var annotations = getAnnotations(template);
            var iconUrl = annotations["fabric8." + id + "/iconUrl"] || annotations["fabric8/iconUrl"];
            if (iconUrl) {
              (template.objects || []).forEach((item) => {
                var entityName = getName(item);
                if (id === entityName) {
                  entity.$iconUrl = iconUrl;
                }
              });
            }
          }
        });
      }
      if (!entity.$iconUrl) {
        entity.$iconUrl = defaultIconUrl;
      }
    }

    public maybeInit() {
      this.servicesByKey = {};
      this.podsByKey = {};
      this.replicationControllersByKey = {};
      this.replicas = [].concat(this.replicationcontrollers, this.replicasets);
      this.allDeployments = [].concat(this.deploymentconfigs, this.deployments);
      populateKeys(this.replicas);
      populateKeys(this.allDeployments);
      this.enrichPods();
      this.enrichServices();
      this.enrichDeployments();
      this.enrichReplicas();
      this.updateApps();
      this.handleRoutes();
      this.environments = this.loadEnvironments();
      this.hosts = this.buildHosts();
      enrichBuildConfigs(this.buildconfigs);
      enrichEvents(this.events, this);
    }

    protected buildHosts() {
      var podsByHost = {};
      this.pods.forEach((pod) => {
        var host = getHost(pod);
        var podsForHost = podsByHost[host];
        if (!podsForHost) {
          podsForHost = [];
          podsByHost[host] = podsForHost;
        }
        podsForHost.push(pod);
      });
      this.podsByHost = podsByHost;

      var tmpHosts = [];
      for (var hostKey in podsByHost) {
        var hostPods = [];
        var podCounters = createPodCounters((pod) => getHost(pod) === hostKey, this.pods, hostPods, "host=" + hostKey);
        var hostIP = null;
        if (hostPods.length) {
          var pod = hostPods[0];
          var currentState = pod.status;
          if (currentState) {
            hostIP = currentState.hostIP;
          }
        }
        var hostDetails = {
          name: hostKey,
          id: hostKey,
          elementId: hostKey.replace(/\./g, '_'),
          hostIP: hostIP,
          pods: hostPods,
          kind: "Host",
            $podCounters: podCounters,
            $iconUrl: hostIconUrl
        };
        tmpHosts.push(hostDetails);
      }
      return tmpHosts;
    }

    // Handle routes, openshift specific, on vanilla k8s this is a noop
    protected handleRoutes() {
      angular.forEach(this.routes, (route) => {
        var metadata = route.metadata || {};
        var spec = route.spec || {};
        var serviceName = Core.pathGet(spec, ["to", "name"]);
        var host = spec.host;
        var namespace = getNamespace(route);
        if (serviceName && host) {
          var service = this.getService(namespace, serviceName);
          if (service) {
            service.$host = host;

            var servicescheme = Kubernetes.getAnnotation(service, "api.service.kubernetes.io/scheme") ||
            spec.tls ? "https" : "http";

      var hostUrl = host;
      if (hostUrl.indexOf("://") < 0) {
        hostUrl = servicescheme + "://" + host;
      }
      service.$connectUrl = UrlHelpers.join(hostUrl, "/");

      var servicepath = getAnnotation(service, "servicepath") || getAnnotation(service, "api.service.kubernetes.io/path");
      if (servicepath) {
        service.$connectUrl = UrlHelpers.join(service.$connectUrl, servicepath);
      }

      // TODO definitely need that annotation, temp hack for apiman link
      if (getName(service) === 'apiman') {
        service.$connectUrl = (<any> new URI().scheme(servicescheme).host(service.$host)
            .path('apimanui/api-manager/')).toString();
        service.$actionUrl = (<any> new URI().scheme(servicescheme).host(service.$host)
            .path('apimanui/link')).toString();
        service.$connectTemplate = `
          <span ng-controller="Kubernetes.PostController">
          <form action="{{item.$actionUrl}}" method="POST">
          <input type="hidden" name="redirect" value="{{item.$connectUrl}}">
          <input type="hidden" name="access_token" value="{{accessToken}}">
          </form>
          <a href="" ng-click="go()">{{item.$host}}</a>
          </span>
          `;
      }
          } else {
            log.debug("Could not find service " + serviceName + " namespace " + namespace + " for route: " + metadata.name);
          }
        }
      });
    }

    protected enrichDeployments() {
      this.allDeployments.forEach((deployment) => {
        if (!deployment.kind) deployment.kind = "Deployment";
        this.deploymentsByKey[deployment._key] = deployment;
        var selector = getSelector(deployment);
        deployment.$pods = [];
        deployment.$podCounters = selector ? createPodCounters(selector, this.pods, deployment.$pods) : null;
        deployment.$podCount = deployment.$pods.length;
        deployment.$replicas = (deployment.spec || {}).replicas;

        var selectedPods = deployment.$pods;
        deployment.connectTo = selectedPods.map((pod) => {
          return pod._key;
        }).join(',');
        deployment.$labelsText = Kubernetes.labelsToString(getLabels(deployment));
        this.updateIconUrlAndAppInfo(deployment, "deploymentNames");
        var iconUrl =  deployment.$iconUrl;
        if (iconUrl && selectedPods) {
          selectedPods.forEach((pod) => {
            pod.$iconUrl = iconUrl;
          });
        }
      });
    }

    protected enrichReplicas() {
      this.replicas.forEach((replica) => {
        if (!replica.kind) replica.kind = "ReplicationController";
        this.replicasByKey[replica._key] = replica
        var selector = getSelector(replica);
        replica.$pods = [];
        replica.$podCounters = selector ? createPodCounters(selector, this.pods, replica.$pods) : null;
        replica.$podCount = replica.$pods.length;
        replica.$replicas = (replica.spec || {}).replicas;

        var selectedPods = replica.$pods;
        replica.connectTo = selectedPods.map((pod) => {
          return pod._key;
        }).join(',');
        replica.$labelsText = Kubernetes.labelsToString(getLabels(replica));
        this.updateIconUrlAndAppInfo(replica, "replicaNames");
        var iconUrl =  replica.$iconUrl;
        if (iconUrl && selectedPods) {
          selectedPods.forEach((pod) => {
            pod.$iconUrl = iconUrl;
          });
        }
      });
    }

    protected enrichServices() {
      this.services.forEach((service) => {
        if (!service.kind) service.kind = "Service";
        this.servicesByKey[service._key] = service;
        var selector = getSelector(service);
        service.$pods = [];
        if (!service.$podCounters) {
          service.$podCounters = {};
        }
        var podLinkUrl = UrlHelpers.join(HawtioCore.documentBase(), "/kubernetes/namespace", service.metadata.namespace, "pods");
        _.assign(service.$podCounters, selector ? createPodCounters(selector, this.pods, service.$pods, Kubernetes.labelsToString(selector, ","), podLinkUrl) : {});
        service.$podCount = service.$pods.length;

        var selectedPods = service.$pods;
        service.connectTo = selectedPods.map((pod) => {
          return pod._key;
        }).join(',');
        service.$labelsText = Kubernetes.labelsToString(getLabels(service));
        this.updateIconUrlAndAppInfo(service, "serviceNames");
        var spec = service.spec || {};
        service.$portalIP = spec.portalIP;
        service.$selectorText = Kubernetes.labelsToString(spec.selector);
        var ports = _.map(spec.ports || [], "port");
        service.$ports = ports;
        service.$portsText = ports.join(", ");
        var iconUrl = service.$iconUrl;
        if (iconUrl && selectedPods) {
          selectedPods.forEach((pod) => {
            pod.$iconUrl = iconUrl;
          });
        }
        service.$serviceUrl = serviceLinkUrl(service);
      });
      // services may not map to an icon but their pods may do via the RC
      // so lets default it...
      this.services.forEach((service) => {
        var iconUrl = service.$iconUrl;
        var selectedPods = service.$pods;
        if (selectedPods) {
          if (!iconUrl || iconUrl === defaultIconUrl) {
            iconUrl = null;
            selectedPods.forEach((pod) => {
              if (!iconUrl) {
                iconUrl = pod.$iconUrl;
                if (iconUrl) {
                  service.$iconUrl = iconUrl;
                }
              }
            });
          }
        }
      });
    }

    protected enrichPods() {
      this.pods.forEach((pod) => {
        if (!pod.kind) pod.kind = "Pod";
        this.podsByKey[pod._key] = pod;
        var host = getHost(pod);
        pod.$labelsText = Kubernetes.labelsToString(getLabels(pod));
        if (host) {
          pod.$labelsText += labelFilterTextSeparator + "host=" + host;
        }
        pod.$iconUrl = defaultIconUrl;
        this.discoverPodConnections(pod);
        pod.$containerPorts = [];

        var podStatus = pod.status || {};
        var startTime = podStatus.startTime;
        pod.$startTime = null;
        if (startTime) {
          pod.$startTime = new Date(startTime);
        }
        var createdTime = getCreationTimestamp(pod);
        pod.$createdTime = null;
        pod.$age = null;
        if (createdTime) {
          pod.$createdTime = new Date(createdTime);
          pod.$age = humandate.relativeTime(pod.$createdTime);
        }
        var ready = isReady(pod);
        pod.$ready = ready;
        pod.$statusCss = statusTextToCssClass(pod);

        var maxRestartCount = 0;
        angular.forEach(Core.pathGet(pod, ["status", "containerStatuses"]), (status) => {
          var restartCount = status.restartCount;
          if (restartCount) {
            if (restartCount > maxRestartCount) {
              maxRestartCount = restartCount;
            }
          }
        });
        if (maxRestartCount ) {
          pod.$restartCount = maxRestartCount;
        }
        var imageNames = "";
        angular.forEach(Core.pathGet(pod, ["spec", "containers"]), (container) => {
          var image = container.image;
          if (image) {
            if (!imageNames) {
              imageNames = image;
            } else {
              imageNames = imageNames + " " + image;
            }
            var idx = image.lastIndexOf(":");
            if (idx > 0) {
              image = image.substring(0, idx);
            }
            var paths = image.split("/", 3);
            if (paths.length) {
              var answer = null;
              if (paths.length == 3) {
                answer = paths[1] + "/" + paths[2];
              } else if (paths.length == 2) {
                answer = paths[0] + "/" + paths[1];
              } else {
                answer = paths[0] + "/" + paths[1];
              }
              container.$imageLink = UrlHelpers.join("https://registry.hub.docker.com/u/", answer);
            }
          }
          angular.forEach(container.ports, (port) => {
            var containerPort = port.containerPort;
            if (containerPort) {
              pod.$containerPorts.push(containerPort);
            }
          });
        });
        pod.$imageNames = imageNames;
        var podStatus = podStatus;
        var podSpec = (pod.spec || {});
        pod.$podIP = podStatus.podIP;
        pod.$host = podSpec.host || podSpec.nodeName || podStatus.hostIP;
      });
    }

    // Create an array of apps, objects that combine associated API objects
    protected updateApps() {
      // inner function to create an empty appObject
      function createAppView(name, $iconUrl) {
        var appView:any = {
          kind: 'App',
          appPath: "/dummyPath/" + name,
          $name: name,
          $iconUrl: $iconUrl,
          $info: {
            $iconUrl: $iconUrl
          },
          metadata: {
            name: name,
            namespace: this.currentNamespace
          }
        };
        // create a setter to shim old views that use this attribute
        Object.defineProperty(appView, "replicationControllers", {
          get: () => {
            return [].concat(appView.replicationcontrollers || [], appView.replicasets || []);
          }
        });
        return appView;
      }

      try {
        // lets create the app views by trying to join controllers / services / pods that are related
        var appViews = [];

        // inner function to build an app view from some object
        function buildAppViewUsing(self, thing) {
          var selector = getSelector(thing);
          var objects = self.objectsWithLabels(selector);
          var name = getName(thing);
          var $iconUrl = thing.$iconUrl || defaultIconUrl;
          // fix for any app that doesn't have a proper icon defined
          if ($iconUrl === "data:image/svg+xml;charset=UTF-8;base64,") {
            $iconUrl = defaultIconUrl;
          }
          var appView = createAppView(name, $iconUrl);
          _.forEach(objects, (object) => {
            var collectionName = KubernetesAPI.toCollectionName(object.kind);
            var objects = appView[collectionName] || [];
            objects.push(object);
            appView[collectionName] = objects;
          });
          appViews.push(appView);
        }

        // build apps from deployments
        _.forEach(this.allDeployments, (deployment) => {
          buildAppViewUsing(this, deployment);
        });

        // now create apps from RCs and ReplicaSets that don't have deployments
        _.forEach(this.replicas, (replica) => {
          var name = getName(replica);
          var existingApp = _.find(appViews, (appView) => {
            var appName = getName(appView);
            return _.startsWith(name, appName);
          });
          if (!existingApp) {
            buildAppViewUsing(this, replica);
          }
        });

        log.debug("Apps: ", appViews);

        // when not on OpenShift we don't have a Rroute
        this.services.forEach((service) => {
          var $serviceUrl = serviceLinkUrl(service);
          service.$serviceUrl = $serviceUrl;
          service.$connectUrl = $serviceUrl;
          if ($serviceUrl) {
            var idx = $serviceUrl.indexOf("://");
            if (idx > 0) {
              service.$connectHost = Core.trimTrailing($serviceUrl.substring(idx + 3), "/");
            }
          }
        });

        appViews = _.sortBy(populateKeys(appViews), (appView) => appView._key);
        ArrayHelpers.sync(this.appViews, appViews, '$name');

        var folderMap = {};
        var folders = [];
        var appMap = {};
        this.appFolders = _.sortBy(folders, "path");
        angular.forEach(this.appViews, (appView:any) => {
          try {
            appView.$podCounters = createAppViewPodCounters(appView);
            appView.$podCount = (appView.pods || []).length;
            appView.$replicationControllersText = (appView.replicationControllers || []).map((i) => i["_key"]).join(" ");
            appView.$servicesText= (appView.services || []).map((i) => i["_key"]).join(" ");
            appView.$serviceViews = createAppViewServiceViews(appView);
          } catch (e) {
            log.warn("Failed to update appViews: " + e);
          }
        });
      } catch (e) {
        log.warn("Caught error: " + e);
      }
    }

    /**
     * Returns the name of the environment for the given project namespace and environment namespace
     */
    public environmentName(projectNamespace, environmentNamespace) {
      var answer = "";
      var environments = this.namespaceEnvironments[projectNamespace];
      angular.forEach(environments, (env) => {
        if (environmentNamespace === env.namespace) {
          answer = env.name || env.label || answer;
        }
      });
      return answer || environmentNamespace;
    }

    /**
     * Loads the environments for the given project
     */
    protected loadEnvironments() {
      var answer = [];
      var model = Kubernetes.getKubernetesModel();
      if (model) {
        var configmap = Kubernetes.getNamed(this.configmaps, environemntsConfigMapName);
        if (configmap) {
          var ns = getNamespace(configmap);
          angular.forEach(configmap.data, (yamlText, key) => {
            try {
              var values = jsyaml.load(yamlText);
              var env = this.createEnvironment(key, values, ns);
              if (env) {
                answer.push(env);
              }
            } catch (err) {
              log.warn("Failed to read yaml environment " + key +
                " with YAML: " + yamlText + ". Error: " + err, err);
              return;
            }
          });
          if (ns) {
            this.namespaceEnvironments[ns] = answer;
          }
        }
      }
      return _.sortBy(answer, (element) => element['order']);
    }

    public createEnvironment(key, values, ns) {
      values["key"] = key;
      values["label"] = values["label"] || values["name"];

      var envNamespace = values["namespace"];
      if (envNamespace) {
        values["$environmentLink"] = Developer.environmentLink(null, envNamespace);
        values["$editLink"] = UrlHelpers.join(HawtioCore.documentBase(), '/workspaces', ns, "/environments/edit", key);
      }
      return values;
    }

    protected discoverPodConnections(entity) {
      var info = Core.pathGet(entity, ["status", "info"]);
      var hostPort = null;
      var currentState = entity.status || {};
      var desiredState = entity.spec || {};
      var podId = getName(entity);
      var host = currentState["hostIP"];
      var podIP = currentState["podIP"];
      var hasDocker = false;
      var foundContainerPort = null;
      if (desiredState) {
        var containers = desiredState.containers;
        angular.forEach(containers, (container) => {
          if (!hostPort) {
            var ports = container.ports;
            angular.forEach(ports, (port) => {
              if (!hostPort) {
                var containerPort = port.containerPort;
                var portName = port.name;
                var containerHostPort = port.hostPort;
                if (containerPort === 8778 || "jolokia" === portName) {
                  if (containerPort) {
                    if (podIP) {
                      foundContainerPort = containerPort;
                    }
                    if (containerHostPort) {
                      hostPort = containerHostPort;
                    }
                  }
                }
              }
            });
          }
        });
      }
      if (foundContainerPort && podId && isRunning(currentState)) {
        if (!Kubernetes.isOpenShift) {
          // TODO temp workaround for k8s on GKE https://github.com/kubernetes/kubernetes/issues/17172
          entity.$jolokiaUrl = UrlHelpers.join(Kubernetes.masterApiUrl(),
              "api",
              Kubernetes.defaultApiVersion,
              "proxy",
              "namespaces",
              entity.metadata.namespace ,
              "pods",
              //"https:" + podId + ":" + foundContainerPort,
              podId + ":" + foundContainerPort,
              "jolokia/");
        } else {
          entity.$jolokiaUrl = UrlHelpers.join(Kubernetes.masterApiUrl(),
              "api",
              Kubernetes.defaultApiVersion,
              "namespaces",
              entity.metadata.namespace ,
              "pods",
              "https:" + podId + ":" + foundContainerPort,
              "proxy/jolokia/");

        }
      }
    }
  }

  function getServiceForName(model, serviceName) {
    var key = createKey('default', serviceName, 'service');
    var answer = model.servicesByKey[key];
    log.debug("found template service: ", answer);
    return answer;
  }

  export function getJenkinshiftBuildConfigURL($scope) {
    return getJenkinshiftProxyUrlFor($scope, jenkinshiftServiceName, '/oapi/v1/namespaces/default/buildconfigs');
  }

  function getJenkinshiftProxyUrlFor($scope, serviceName, path) {
    if (!$scope) {
      $scope = getKubernetesModel();
    }
    if ($scope) {
      var proxyService = getServiceForName($scope, serviceName);
      if (proxyService) {
        var proxyUrl = proxyService.proxyUrl;
        if (proxyUrl) {
          proxyUrl = Core.trimTrailing(proxyUrl, "/") + ":80";
          return UrlHelpers.join(proxyUrl, path);
        }
      }
    }
    return null;
  }


  /**
   * Creates a model service which keeps track of all the pods, replication controllers and services along
   * with their associations and status
   */
  _module.factory('KubernetesModel', ['$rootScope', '$http', 'KubernetesApiURL', 'KubernetesState', 'WatcherService', '$location', '$resource', ($rootScope, $http, AppLibraryURL, KubernetesState, watcher:WatcherService, $location:ng.ILocationService, $resource:ng.resource.IResourceService) => {

    var $scope = new KubernetesModelService();
    $scope.kubernetes = KubernetesState;
    $scope.watcher = watcher;

    // create all of our resource classes
    var typeNames = watcher.getTypes();
    _.forEach(typeNames, (type:string) => {
      var urlTemplate = uriTemplateForKubernetesKind(type);
      $scope[type + 'Resource'] = createResource(type, urlTemplate, $resource, $scope);
    });

    if (!isOpenShift) {
      // register custom URL factories for buildconfigs
      watcher.registerCustomUrlFunction(KubernetesAPI.WatchTypes.BUILD_CONFIGS,
          (options:KubernetesAPI.K8SOptions) =>
              getJenkinshiftBuildConfigURL($scope));
      // register custom URL factories for templates/projects
      // TOOD replace with jenkinshift once the catalog can work from ConfigMap
      //var templatesServiceName = "jenkinshiftServiceName";
      var templatesServiceName = "templates";
      watcher.registerCustomUrlFunction(KubernetesAPI.WatchTypes.TEMPLATES,
          (options:KubernetesAPI.K8SOptions) =>
              getJenkinshiftProxyUrlFor($scope, templatesServiceName, '/oapi/v1/namespaces/default/templates'));
    }

    watcher.registerCustomUrlFunction(KubernetesAPI.WatchTypes.INGRESSES,
        (options:KubernetesAPI.K8SOptions) => UrlHelpers.join(masterApiUrl(), kubernetesExperimentalApiPrefix(), '/ingresses'));

    // register for all updates on objects
		watcher.registerListener((objects:ObjectMap) => {
			var types = watcher.getTypes();
			_.forEach(types, (type:string) => {
				switch (type) {
					case WatchTypes.SERVICES:
						var items = populateKeys(objects[type]);
						angular.forEach(items, (item) => {
              item.proxyUrl = kubernetesProxyUrlForService(kubernetesApiUrl(), item);
            });
						$scope[type] = items;
						break;
          case WatchTypes.TEMPLATES:
          case WatchTypes.ROUTES:
          case WatchTypes.BUILDS:
          case WatchTypes.BUILD_CONFIGS:
          case WatchTypes.IMAGE_STREAMS:
            // don't put a break here :-)
					default:
						$scope[type] = populateKeys(objects[type]);
				}
        log.debug("Type: ", type, " object: ", $scope[type]);
			});
			$scope.maybeInit();
      $rootScope.$broadcast('kubernetesModelUpdated', $scope);
      Core.$apply($rootScope);
		});

    // set the selected namespace if set in the location bar
    // otherwise use whatever previously selected namespace is
    // available
    var search = $location.search();
    if ('namespace' in search) {
      watcher.setNamespace(search['namespace']);
    }

    function selectPods(pods, namespace, labels) {
      return pods.filter((pod) => {
        return getNamespace(pod) === namespace && selectorMatches(labels, getLabels(pod));
      });
    }
    return $scope;
  }]);

}
