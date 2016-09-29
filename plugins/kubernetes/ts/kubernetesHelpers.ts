/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesInterfaces.ts"/>
/// <reference path="../../developer/ts/developerNavigation.ts"/>
module Kubernetes {

  export var context = '/kubernetes';
  export var hash = '#' + context;
  export var defaultRoute = hash + '/apps';
  export var pluginName = 'Kubernetes';
  export var pluginPath = 'plugins/kubernetes/';
  export var templatePath = pluginPath + 'html/';
  export var log:Logging.Logger = Logger.get(pluginName);

  export var keepPollingModel = true;

  export var defaultIconUrl = Core.url("/img/kubernetes.svg");
  export var hostIconUrl = Core.url("/img/host.svg");

  // this gets set as a pre-bootstrap task
  export var osConfig:KubernetesConfig = undefined;
  export var masterUrl = "";

  export var defaultApiVersion = "v1";
  export var defaultOSApiVersion = "v1";
  export var labelFilterTextSeparator = ",";

  export var defaultNamespace = "default";

  export var appSuffix = ".app";

  // kubernetes service names
  export var kibanaServiceName = "kibana";
  export var fabric8ForgeServiceName = "fabric8-forge";
  export var gogsServiceName = "gogs";
  export var jenkinsServiceName = "jenkins";
  export var apimanServiceName = 'apiman';
  export var isOpenShift = true;

  export var sshSecretDataKeys = ["ssh-key", "ssh-key.pub"];
  export var httpsSecretDataKeys = ["username", "password"];


  export function kubernetesNamespacePath() {
    var ns = currentKubernetesNamespace();
    if (ns) {
      return "/namespaces/" + ns;
    } else {
      return "";
    }
  }

  export function apiPrefix() {
    var prefix = Core.pathGet(osConfig, ['api', 'k8s', 'prefix']);
    if (!prefix) {
      prefix = 'api';
    }
    return Core.trimLeading(prefix, '/');
  }

  export function osApiPrefix() {
    var prefix = Core.pathGet(osConfig, ['api', 'openshift', 'prefix']);
    if (!prefix) {
      prefix = 'oapi';
    }
    var answer = Core.trimLeading(prefix, '/');
    if (!isOpenShift) {
      return UrlHelpers.join(apiPrefix(), defaultOSApiVersion, "proxy", kubernetesNamespacePath(), "services/templates", answer);
    }
    return answer;
  }

  export function masterApiUrl() {
    return masterUrl || "";
  }

  /** WARNING - this excludes the host name - you probably want to use: kubernetesApiUrl() instead!! */
  export function kubernetesApiPrefix() {
    return UrlHelpers.join(apiPrefix(), defaultApiVersion);
  }

  export function kubernetesExperimentalApiPrefix() {
    return UrlHelpers.join("/apis/extensions/v1beta1");
  }

  export function openshiftApiPrefix() {
    return UrlHelpers.join(osApiPrefix(), defaultOSApiVersion);
  }

  export function prefixForType(type:string) {
    if (type === WatchTypes.NAMESPACES) {
      return kubernetesApiPrefix();
    }
    if (type === WatchTypes.INGRESSES) {
      return kubernetesExperimentalApiPrefix();
    }
    if (_.any(NamespacedTypes.k8sTypes, (t) => t === type)) {
      return kubernetesApiPrefix();
    }
    if (_.any(NamespacedTypes.osTypes, (t) => t === type)) {
      return openshiftApiPrefix();
    }
    // lets assume its an OpenShift extension type
    return openshiftApiPrefix();
  }

  export function kubernetesApiUrl() {
    return UrlHelpers.join(masterApiUrl(), kubernetesApiPrefix());
  }

  export function kubernetesExperimentalApiUrl() {
    return UrlHelpers.join(masterApiUrl(), kubernetesExperimentalApiPrefix());
  }

  export function openshiftApiUrl() {
    return UrlHelpers.join(masterApiUrl(), openshiftApiPrefix());
  }

  export function resourcesUriForKind(type, ns = null) {
    if (!ns) {
      ns = currentKubernetesNamespace();
    }
    return UrlHelpers.join(masterApiUrl(), prefixForType(type), namespacePathForKind(type, ns));
  }

  export function uriTemplateForKubernetesKind(type) {
    var urlTemplate = '';
    switch (type) {
      case WatchTypes.NAMESPACES:
      case "Namespaces":
        urlTemplate = UrlHelpers.join('namespaces');
        break;
      case WatchTypes.INGRESSES:
      case "ingresses":
        urlTemplate = UrlHelpers.join('ingresses');
        break;
      case WatchTypes.OAUTH_CLIENTS:
      case "OAuthClients":
      case "OAuthClient":
        return UrlHelpers.join('oauthclients');
      case WatchTypes.PROJECTS:
      case "Projects":
        urlTemplate = UrlHelpers.join('projects');
        break;
      default:
        urlTemplate = UrlHelpers.join('namespaces/:namespace', type, ':id');
    }
    return urlTemplate;
  }

  export function namespacePathForKind(type, ns) {
    var urlTemplate = '';
    switch (type) {
      case WatchTypes.NAMESPACES:
      case "Namespaces":
      case "Namespace":
        return UrlHelpers.join('namespaces');
      case WatchTypes.INGRESSES:
      case "ingresses":
        urlTemplate = UrlHelpers.join('ingresses');
        break;
      case WatchTypes.NODES:
      case "Nodes":
      case "node":
        return UrlHelpers.join('nodes');
      case WatchTypes.PROJECTS:
      case "Projects":
      case "Project":
        return UrlHelpers.join('projects');
      case WatchTypes.OAUTH_CLIENTS:
      case "OAuthClients":
      case "OAuthClient":
        return UrlHelpers.join('oauthclients');
      case WatchTypes.PERSISTENT_VOLUMES:
      case "PersistentVolumes":
      case "PersistentVolume":
        return UrlHelpers.join('persistentvolumes');
      default:
        return UrlHelpers.join('namespaces', ns, type);
    }
  }

  /**
   * Returns thevalue from the injector if its available or null
   */
  export function inject<T>(name):T {
    var injector = HawtioCore.injector;
    return injector ? injector.get<T>(name) : null;
  }

  export function createResource(thing:string, urlTemplate:string, $resource: ng.resource.IResourceService, KubernetesModel) {
    var prefix = prefixForType(thing);
    if (!prefix) {
      log.debug("Invalid type given: ", thing);
      return null;
    }

    var params = <any> {
      namespace: currentKubernetesNamespace
    }
    switch (thing) {
      case WatchTypes.NAMESPACES:
      case WatchTypes.OAUTH_CLIENTS:
      case WatchTypes.NODES:
      case WatchTypes.PROJECTS:
      case WatchTypes.OAUTH_CLIENTS:
      case WatchTypes.PERSISTENT_VOLUMES:
      params = {};
    }

    var url = UrlHelpers.join(masterApiUrl(), prefix, urlTemplate);
    log.debug("Url for ", thing, ": ", url);
    var resource = $resource(url, null, {
      query: { method: 'GET', isArray: false, params: params},
      create: { method: 'POST', params: params},
      save: { method: 'PUT', params: params},
      delete: { method: 'DELETE', params: _.extend({
        id: '@id'
      }, params)}
    });
    return resource;
  }

  export function imageRepositoriesRestURL() {
    return UrlHelpers.join(openshiftApiUrl(), kubernetesNamespacePath(), "/imagestreams");
  }

  export function deploymentConfigsRestURL() {
    return UrlHelpers.join(openshiftApiUrl(), kubernetesNamespacePath(), "/deploymentconfigs");
  }

  export function buildsRestURL() {
    return UrlHelpers.join(openshiftApiUrl(), kubernetesNamespacePath(), "/builds");
  }

  export function buildConfigHooksRestURL() {
    if (!isOpenShift) {
      return getJenkinshiftBuildConfigURL(null);
    }
    return UrlHelpers.join(openshiftApiUrl(), kubernetesNamespacePath(), "/buildconfighooks");
  }

  export function buildConfigsRestURL() {
    if (!isOpenShift) {
      return getJenkinshiftBuildConfigURL(null);
    }
    return UrlHelpers.join(openshiftApiUrl(), kubernetesNamespacePath(), "/buildconfigs");
  }

  export function routesRestURL() {
    return UrlHelpers.join(openshiftApiUrl(), kubernetesNamespacePath(), "/routes");
  }

  export function templatesRestURL() {
    return UrlHelpers.join(openshiftApiUrl(), kubernetesNamespacePath(), "/templates");
  }

  export function getNamespace(entity) {
    var answer = Core.pathGet(entity, ["metadata", "namespace"]);
    return answer ? answer : currentKubernetesNamespace();
  }

  export function getLabels(entity) {
    var answer = Core.pathGet(entity, ["metadata", "labels"]);
    return answer ? answer : {};
  }

  export function getAnnotations(entity) {
    var answer = Core.pathGet(entity, ["metadata", "annotations"]) || {};
    var templateAnnotations = Core.pathGet(entity, ["spec", "template", "metadata", "annotations"]);
    if (templateAnnotations) {
      var result = {};
      _.assign(result, templateAnnotations, answer);
      return result;
    }
    return answer;
  }

  export function getAnnotation(entity, annotation) {
    return getAnnotations(entity)[annotation];
  }

  export function getName(entity) {
    if (angular.isString(entity)) {
      return entity;
    }
    return Core.pathGet(entity, ["metadata", "name"]) || Core.pathGet(entity, "name") || Core.pathGet(entity, "id");
  }

  export function getNamed(array, name: string):any {
    return _.find(array, (val) => {
      return getName(val) === name;
    });
  }

  export function getKind(entity) {
    return Core.pathGet(entity, ["metadata", "kind"]) || Core.pathGet(entity, "kind");
  }

  export function getSelector(entity) {
    if (entity.kind === "ReplicaSet" || entity.kind === "Deployment") {
      var answer = Core.pathGet(entity, ["spec", "selector", "matchLabels"]);
      if (answer) {
        return answer;
      }
    }
    return Core.pathGet(entity, ["spec", "selector"]);
  }

  export function getHost(pod) {
    return Core.pathGet(pod, ["spec", "host"]) || Core.pathGet(pod, ["spec", "nodeName"]) || Core.pathGet(pod, ["status", "hostIP"]);
  }

  export function getStatus(pod) {
    var answer = Core.pathGet(pod, ["status", "phase"]);
    return answer;
  }

  export function getPorts(service) {
    return Core.pathGet(service, ["spec", "ports"]);
  }

  export function getCreationTimestamp(entity) {
    return Core.pathGet(entity, ["metadata", "creationTimestamp"]);
  }

  //var fabricDomain = Fabric.jmxDomain;
  var fabricDomain = "io.fabric8";
  export var mbean = fabricDomain + ":type=Kubernetes";
  export var managerMBean = fabricDomain + ":type=KubernetesManager";
  export var appViewMBean = fabricDomain + ":type=AppView";


  export function getKubernetesModel(): KubernetesModelService {
    return <KubernetesModelService> Kubernetes.inject("KubernetesModel");
  }
  
  export function isAppView(workspace?) {
    // return workspace.treeContainsDomainAndProperties(fabricDomain, {type: "AppView"});
    return true;
  }

  export function getStrippedPathName():string {
    var pathName = Core.trimLeading((this.$location.path() || '/'), "#");
    pathName = pathName.replace(/^\//, '');
    return pathName;
  }

  export function linkContains(...words:String[]):boolean {
    var pathName = this.getStrippedPathName();
    return _.every(words, (word:string) => pathName.indexOf(word) !== 0);
  }


  /**
   * Returns true if the given link is active. The link can omit the leading # or / if necessary.
   * The query parameters of the URL are ignored in the comparison.
   * @method isLinkActive
   * @param {String} href
   * @return {Boolean} true if the given link is active
   */
  export function isLinkActive(href:string):boolean {
    // lets trim the leading slash
    var pathName = getStrippedPathName();

    var link = Core.trimLeading(href, "#");
    link = link.replace(/^\//, '');
    // strip any query arguments
    var idx = link.indexOf('?');
    if (idx >= 0) {
      link = link.substring(0, idx);
    }
    if (!pathName.length) {
      return link === pathName;
    } else {
      return _.startsWith(pathName, link);
    }
  }

  export function setJson($scope, id, collection) {
    $scope.id = id;
    if (!$scope.fetched) {
      return;
    }
    if (!id) {
      $scope.json = '';
      return;
    }
    if (!collection) {
      return;
    }
    var item = collection.find((item) => { return getName(item) === id; });
    if (item) {
      $scope.json = angular.toJson(item, true);
      $scope.item = item;
    } else {
      $scope.id = undefined;
      $scope.json = '';
      $scope.item = undefined;
    }
  }

  /**
   * Returns the labels text string using the <code>key1=value1,key2=value2,....</code> format
   */
  export function labelsToString(labels, seperatorText = labelFilterTextSeparator) {
    var answer = "";
    angular.forEach(labels, (value, key) => {
      var separator = answer ? seperatorText : "";
      answer += separator + key + "=" + value;
    });
    return answer;
  }


  export function initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL) {
    $scope.baseUri = Core.trimTrailing(Core.url("/") || "", "/") || "";

    var injector = HawtioCore.injector;

    function hasService(name) {
      if (injector) {
        var ServiceRegistry = injector.get<any>("ServiceRegistry");
        if (ServiceRegistry) {
          return ServiceRegistry.hasService(name);
        }
      }
      return false;
    }

    $scope.hasServiceKibana = () => hasService(kibanaServiceName);
    $scope.hasServiceGogs = () => hasService(gogsServiceName);
    $scope.hasServiceForge = () => hasService(fabric8ForgeServiceName);
    $scope.hasServiceApiman = () => hasService(apimanServiceName);

    $scope.viewTemplates = () => {
      var returnTo = $location.url();
      var path = "";
      if ($scope.$projectNamespaceLink) {
        goToPath($location, UrlHelpers.join($scope.$projectNamespaceLink, 'templates'));
      } else {
        goToPath($location, UrlHelpers.join('/kubernetes/namespace', $scope.namespace, '/templates'));
      }
      $location.search({'returnTo': returnTo});
    };

    $scope.namespace = $routeParams.namespace || $scope.namespace || KubernetesState.selectedNamespace || defaultNamespace;
    if ($scope.namespace != KubernetesState.selectedNamespace) {
      KubernetesState.selectedNamespace = $scope.namespace;

      // lets show page is going to reload
      if ($scope.model) {
        $scope.model.fetched = false;
      }
    }
    Kubernetes.setCurrentKubernetesNamespace($scope.namespace);

    $scope.forgeEnabled = isForgeEnabled();

    $scope.projectId = $routeParams["project"] || $scope.projectId || $scope.id;

    var showProjectNavBars = false;
    if ($scope.projectId && showProjectNavBars) {
      $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.projectId);
      $scope.subTabConfig = Developer.createProjectSubNavBars($scope.projectId, null, $scope);
    } else {
      $scope.breadcrumbConfig = Developer.createEnvironmentBreadcrumbs($scope, $location, $routeParams);
      $scope.subTabConfig = Developer.createEnvironmentSubNavBars($scope, $location, $routeParams);
    }

    if ($scope.projectId) {
      $scope.$projectLink = Developer.projectLink($scope.projectId);
    }

    $scope.link = (href) => {
      if (!href) {
        return href;
      }
      if ($scope.$projectLink) {
        return Developer.namespaceLink($scope, $routeParams, href.replace(/^\/kubernetes/, ''));
      } else {
        return href;
      }
    };

    $scope.codeMirrorOptions = {
      lineWrapping : true,
      lineNumbers: true,
      readOnly: 'nocursor',
      mode: {name: "javascript", json: true}
    };

    $scope.resizeDialog = {
      controller: null,
      newReplicas: 0,
      dialog: new UI.Dialog(),
      onOk: () => {
        var resizeDialog = $scope.resizeDialog;
        resizeDialog.dialog.close();
        resizeController($http, KubernetesApiURL, resizeDialog.controller, resizeDialog.newReplicas, () => { log.debug("updated number of replicas"); })
      },
      open: (controller) => {
        var resizeDialog = $scope.resizeDialog;
        resizeDialog.controller = controller;
        resizeDialog.newReplicas = Core.pathGet(controller, ["status", "replicas"]) || Core.pathGet(controller, ["spec", "replicas"]);
        resizeDialog.dialog.open();

        $timeout(() => {
          $('#replicas').focus();
        }, 50);
      },
      close: () => {
        $scope.resizeDialog.dialog.close();
      }
    };

    $scope.triggerBuild = (buildConfig) => {
      var url = buildConfig.$triggerUrl;
      log.debug("triggering build at url: " + url);
      if (url) {
        //var data = {};
        var data = null;
        var config = {
          headers: {
            'Content-Type': "application/json"
          }
        };
        var name = Core.pathGet(buildConfig, ["metadata", "name"]);
        Core.notification('info', "Triggering build " + name);
        $http.post(url, data, config).
          success(function (data, status, headers, config) {
            console.log("trigger worked! got data " + angular.toJson(data, true));
            // TODO should we show some link to the build
            Core.notification('info', "Building " + name);
          }).
          error(function (data, status, headers, config) {
            log.warn("Failed to load " + url + " " + data + " " + status);
            Core.notification('error', "Failed to trigger build for " + name + ". Returned code: " + status + " " + data);
          });
      };
    }

    // update the URL if the filter is changed
    $scope.$watch("tableConfig.filterOptions.filterText", (text) => {
      $location.search("q", text);
    });

    $scope.$on("labelFilterUpdate", ($event, text) => {
      var filterOptions = ($scope.tableConfig || {}).filterOptions || {};
      var currentFilter = filterOptions.filterText;
      if (Core.isBlank(currentFilter)) {
        filterOptions.filterText = text;
      } else {
        var expressions = currentFilter.split(/\s+/);
        if (expressions.any(text)) {
          // lets exclude this filter expression
          expressions = expressions.remove(text);
          filterOptions.filterText = expressions.join(" ");
        } else {
          filterOptions.filterText = currentFilter + " " + text;
        }
      }
      $scope.id = undefined;
    });
  }

  /**
   * Returns the number of pods that are ready
   */
  export function readyPodCount(service) {
    var count = 0;
    angular.forEach((service || {}).$pods, (pod)=> {
      if (pod.$ready) {
        count++;
      }
    });
    return count;
  }


  /**
   * Returns the service link URL for either the service name or the service object
   */
  export function serviceLinkUrl(service, httpOnly = false) {
    if (angular.isObject(service)) {
      // let's look up the service path first
      var servicePath = getAnnotation(service, "servicepath") || getAnnotation(service, "api.service.kubernetes.io/path");
      // let's now check if exposeUrl is set and use that
      var exposeUrl = getAnnotation(service, 'fabric8.io/exposeUrl');
      if (exposeUrl && servicePath) {
        return UrlHelpers.join(exposeUrl, servicePath);
      }
      if (exposeUrl) {
        return exposeUrl;
      }
      // Uck, now we have to figure it out from the model
      var portalIP = service.$host;
      // lets assume no custom port for now for external routes
      var port = null;
      var protocol = "http://";
      var spec = service.spec;
      var model = getKubernetesModel();
      var nodeIP = "";
      if (model) {
        var hosts = model['hosts'];
        if (angular.isArray(hosts) && hosts.length) {
          nodeIP = hosts[0].hostIP;
        }
      }
      var nodePort = 0;
      if (spec) {
        var answer = "";
        if (!portalIP && !isOpenShift) {
          portalIP = spec.portalIP;
        }
        if (!portalIP) {
          portalIP = Core.pathGet(service, ["status", "loadBalancer", "ingress", 0, "ip"]);
        }
        var hasHttps = false;
        var hasHttp = false;
        angular.forEach(spec.ports, (portSpec) => {
          var p = portSpec.port;
          if (p) {
            if (p === 443) {
              hasHttps = true;
            } else if (p === 80) {
              hasHttp = true;
            }
            if (!port) {
              port = p;
            }
          }
          if (!portalIP) {
            if (!answer) {
              answer = getIngressServicePortURL(service, portSpec, model);
            }
            if (nodeIP) {
              if (portSpec.nodePort) {
                nodePort = portSpec.nodePort;
              }
            }
          }
        });
        if (!hasHttps && !hasHttp && port) {
          // lets treat 8080 as http which is a common service to export
          if (port === 8080) {
            hasHttp = true;
          } else if (port === 8443) {
            hasHttps = true;
          }
        }
      }
      if (!answer && portalIP) {
        if (hasHttps) {
          answer = "https://" + portalIP;
        } else if (hasHttp) {
          answer = "http://" + portalIP;
        } else if (!httpOnly) {
          if (port) {
            answer = protocol + portalIP + ":" + port + "/";
          } else {
            answer = protocol + portalIP;
          }
        }
      } else if (nodeIP && nodePort) {
        answer = protocol + nodeIP + ":" + nodePort + "/";
      }
      if (answer && servicePath) {
        return UrlHelpers.join(answer, servicePath);
      }
      if (answer) {
        return answer;
      }
      // end if (angular.isObject(service))
    } else if (service) {
      var serviceId = service.toString();
      if (serviceId) {
        var ServiceRegistry = getServiceRegistry();
        if (ServiceRegistry) {
          return ServiceRegistry.serviceLink(serviceId) || "";
        }
      }
    }
    return "";
  }


  function getIngressServiceURL(service, model:Kubernetes.KubernetesModelService = null) {
    var answer = "";
    if (angular.isObject(service)) {
      if (!model) {
        model = getKubernetesModel();
      }
      var spec = service.spec;
      if (spec) {
        angular.forEach(spec.ports, (portSpec) => {
          if (!answer) {
            answer = getIngressServicePortURL(service, portSpec, model);
          }
        });
      }
    }
    return answer;
  }

  function getIngressServicePortURL(service, portSpec, model:Kubernetes.KubernetesModelService = null) {
    var answer = "";
    if (!model) {
      model = getKubernetesModel();
    }
    if (model) {
      var ns = getNamespace(service);
      var serviceName = getName(service);
      angular.forEach(model.ingresses, (ingress) => {
        var ins = getNamespace(ingress);
        if (ns === ins) {
          var spec = ingress.spec;
          if (spec) {
            var rules = spec.rules;
            var tls = spec.tls;
            angular.forEach(spec.rules, (rule) => {
              var http = rule.http;
              if (http) {
                angular.forEach(http.paths, (path) => {
                  var backend = path.backend;
                  var pathSuffix = path.path || "/";
                  if (backend) {
                    var servicePort = backend.servicePort;
                    var backendServiceName = backend.serviceName;
                    if (serviceName === backendServiceName && portsMatch(portSpec, servicePort)) {
                      if (tls) {
                        angular.forEach(tls.hosts, (host) => {
                          if (!answer && host) {
                            answer = "https://" + UrlHelpers.join(host, pathSuffix);
                          }
                        });
                      }
                      var host = rule.host;
                      if (!answer && host) {
                        answer = "http://" + UrlHelpers.join(host, pathSuffix);
                      }
                    }
                  }
                });
              }
            });
          }
        }
      });
    }
    return answer;
  }

  function portsMatch(portSpec, servicePort) {
    if (angular.isObject(portSpec)) {
      if (angular.isNumber(servicePort)) {
        return portSpec.port === servicePort;
      }
      if (angular.isString(servicePort)) {
        return portSpec.name === servicePort;
      }
    }
    if (angular.isObject(servicePort)) {
      var number = portSpec.port;
      var name = portSpec.name;
      if (number) {
        return number === servicePort.intVal;
      }
      if (name) {
        return name === servicePort.strVal;
      }
    }
    return false;
  }

  /**
   * Returns the total number of counters for the podCounters object
   */
  export function podCounterTotal($podCounters) {
    var answer = 0;
    if ($podCounters) {
      angular.forEach(["ready", "valid", "waiting", "error"], (name) => {
        var value = $podCounters[name] || 0;
        answer += value;
      });
    }
    return answer;
  }

  /**
   * Given the list of pods lets iterate through them and find all pods matching the selector
   * and return counters based on the status of the pod
   */
  export function createPodCounters(selector, pods, outputPods = [], podLinkQuery = null, podLinkUrl = null) {
    if (!podLinkUrl) {
      podLinkUrl = Core.url("/kubernetes/pods");
    }
    var filterFn;
    if (angular.isFunction(selector)) {
      filterFn = selector;
    } else {
      filterFn = (pod) => selectorMatches(selector, getLabels(pod));
    }
    var answer = {
      podsLink: "",
      ready: 0,
      valid: 0,
      waiting: 0,
      error: 0
    };
    if (selector) {
      if (!podLinkQuery) {
        podLinkQuery = Kubernetes.labelsToString(selector, " ");
      }
      answer.podsLink = podLinkUrl + "?q=" + encodeURIComponent(podLinkQuery);
      angular.forEach(pods, pod => {
        if (filterFn(pod)) {
          outputPods.push(pod);
          var status = getStatus(pod);
          if (status) {
            var lower = status.toLowerCase();
            if (lower.startsWith("run")) {
              if (isReady(pod)) {
                answer.ready += 1;
              } else {
                answer.valid += 1;
              }
            } else if (lower.startsWith("wait") || lower.startsWith("pend")) {
              answer.waiting += 1;
            } else if (lower.startsWith("term") || lower.startsWith("error") || lower.startsWith("fail")) {
              answer.error += 1;
            }
          } else {
            answer.error += 1;
          }
        }
      });
    }
    return answer;
  }

  /**
   * Converts the given json into an array of items. If the json contains a nested set of items then that is sorted; so that services
   * are processed first; then turned into an array. Otherwise the json is put into an array so it can be processed polymorphically
   */
  export function convertKubernetesJsonToItems(json) {
    var items = json.items;
    if (angular.isArray(items)) {
      // TODO we could check for List or Config types here and warn if not

      // sort the services first
      var answer = [];
      items.forEach((item) => {
        if (item.kind === "Service") {
          answer.push(item);
        }
      });
      items.forEach((item) => {
        if (item.kind !== "Service") {
          answer.push(item);
        }
      });
      return answer;
    } else {
      return [json];
    }
  }

  export function isV1beta1Or2() {
    return defaultApiVersion === "v1beta1" || defaultApiVersion === "v1beta2";
  }

  /**
   * Returns a link to the detail page for the given entity
   */
  export function entityPageLink(obj) {
    if (obj) {
      function getLink(entity) {
        var viewLink = entity["$viewLink"];
        if (viewLink) {
          return viewLink;
        }
        var id = getName(entity);
        var kind = getKind(entity);
        // local customizations to re-use existing views
        if (kind === "DeploymentConfig") {
          kind = "Deployment";
        }
        if (kind === "ReplicaSet") {
          kind = "ReplicationController";
        }
        if (kind && id) {
          var path = kind.substring(0, 1).toLowerCase() + kind.substring(1) + "s";
          var namespace = getNamespace(entity);
          // TODO find the current project namespace and app from the global navigation context?
          // then return a /workspace/foo/app/bar style link?
          if (namespace && !isIgnoreNamespaceKind(kind)) {
            return UrlHelpers.join('/kubernetes/namespace', namespace, path, id);
          } else {
            return UrlHelpers.join('/kubernetes', path, id);
          }
        }
      }
      var baseLink = getLink(obj);
      if (!HawtioCore.injector || !baseLink) {
        return Core.url(baseLink);
      }
      var $routeParams = HawtioCore.injector.get<ng.route.IRouteParamsService>('$routeParams');
      var workspace = $routeParams['workspace'];
      var ns = $routeParams['namespace'];
      var projectId = $routeParams['project'];
      if (!projectId && !ns) {
        return Core.url(baseLink);
      }
      var path = baseLink.replace(/^\/kubernetes\//, '');
      if (_.startsWith(Core.trimLeading(path, "/"), "workspaces/")) {
        return UrlHelpers.join(HawtioCore.documentBase(), path);
      }
      if (workspace) {
        if (projectId) {
          return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspace, "projects", projectId, path);
        } else {
          return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspace, path);
          //return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspace, "namespaces", ns, path);
        }
      } else {
        return UrlHelpers.join(Developer.projectLink(projectId), path);
      }
    }
    return null;
  }


  export function resourceKindToUriPath(kind) {
    var kindPath = kind.toLowerCase() + "s";
    if (kindPath === "replicationControllers" && !isV1beta1Or2()) {
      kindPath = "replicationcontrollers";
    }
    return kindPath;
  }

  function isIgnoreNamespaceKind(kind) {
    return kind === "Host" || kind === "Minion";
  }

  /**
   * Returns the root URL for the kind
   */
  export function kubernetesUrlForKind(KubernetesApiURL, kind, namespace = null, path = null) {
    var pathSegment = "";
    if (path) {
      pathSegment = "/" + Core.trimLeading(path, "/");
    }
    var kindPath = resourceKindToUriPath(kind);
    var ignoreNamespace = isIgnoreNamespaceKind(kind);
    var apiUrl = KubernetesApiURL;
    if (kind == "Deployment" || kind == "Ingress" || kind == "Job" || kind == "ReplicaSet") {
      apiUrl = kubernetesExperimentalApiUrl();
    }
    if (kind == "DeploymentConfig" || kind == "Route") {
      apiUrl = openshiftApiUrl();
    }
    if (isV1beta1Or2() || ignoreNamespace) {
      var postfix = "";
      if (namespace && !ignoreNamespace) {
        postfix = "?namespace=" + namespace;
      }
      return UrlHelpers.join(apiUrl, kindPath, pathSegment, postfix);
    } else {
      return UrlHelpers.join(apiUrl, "/namespaces/", namespace , kindPath, pathSegment);
    }
  };

  /**
   * Returns the base URL for the kind of kubernetes resource or null if it cannot be found
   */
  export function kubernetesUrlForItemKind(KubernetesApiURL, json) {
    var kind = json.kind;
    if (kind) {
      return kubernetesUrlForKind(KubernetesApiURL, kind, json.namespace);
    } else {
      log.warn("Ignoring missing kind " + kind + " for kubernetes json: " + angular.toJson(json));
      return null;
    }
  }

  export function kubernetesProxyUrlForService(KubernetesApiURL, service, path = null) {
    var pathSegment = "";
    if (path) {
      pathSegment = "/" + Core.trimLeading(path, "/");
    } else {
      pathSegment = "/";
    }
    var namespace = getNamespace(service);
    if (isV1beta1Or2()) {
      var postfix = "?namespace=" + namespace;
      return UrlHelpers.join(KubernetesApiURL, "/proxy",  kubernetesNamespacePath(), "/services/" + getName(service) + pathSegment + postfix);
    } else {
      return UrlHelpers.join(KubernetesApiURL, "/proxy/namespaces/", namespace, "/services/" + getName(service) + pathSegment);
    }
  }


  export function kubernetesProxyUrlForServiceCurrentNamespace(service, path = null) {
    var apiPrefix = UrlHelpers.join(kubernetesApiUrl());
    return kubernetesProxyUrlForService(apiPrefix, service, path);

  }
  export function buildConfigRestUrl(id) {
    return UrlHelpers.join(buildConfigsRestURL(), id);
  }

  export function deploymentConfigRestUrl(id) {
    return UrlHelpers.join(deploymentConfigsRestURL(), id);
  }

  export function imageRepositoryRestUrl(id) {
    return UrlHelpers.join(imageRepositoriesRestURL(), id);
  }

  export function buildRestUrl(id) {
    return UrlHelpers.join(buildsRestURL(), id);
  }

  export function buildLogsRestUrl(id) {
    return UrlHelpers.join(buildsRestURL(), id, "log");
  }

  /**
   * Runs the given application JSON
   */
  export function runApp($location, $scope, $http, KubernetesApiURL, json, name = "App", onSuccessFn = null, namespace = null, onCompleteFn = null) {
    if (json) {
      if (angular.isString(json)) {
        json = angular.fromJson(json);
      }
      name = name || "App";
      var postfix = namespace ? " in namespace " + namespace : "";
      Core.notification('info', "Running " + name + postfix);

      var items = convertKubernetesJsonToItems(json);
      angular.forEach(items, (item) => {
        var url = kubernetesUrlForItemKind(KubernetesApiURL, item);
        if (url) {
          $http.post(url, item).
            success(function (data, status, headers, config) {
              log.debug("Got status: " + status + " on url: " + url + " data: " + data + " after posting: " + angular.toJson(item));
              if (angular.isFunction(onCompleteFn)) {
                onCompleteFn();
              }
              Core.$apply($scope);
            }).
          error(function (data, status, headers, config) {
            var message = null;
            if (angular.isObject(data)) {
              message = data.message;
              var reason = data.reason;
              if (reason === "AlreadyExists") {
                // lets ignore duplicates
                log.debug("entity already exists at " + url);
                return;
              }
            }
            if (!message) {
              message = "Failed to POST to " + url + " got status: " + status;
            }
            log.warn("Failed to save " + url + " status: " + status + " response: " + angular.toJson(data, true));
            Core.notification('error', message);
          });
        }
      });
    }
  }


  /**
   * Returns true if the current status of the pod is running
   */
  export function isRunning(podCurrentState) {
    var status = (podCurrentState || {}).phase;
    if (status) {
      var lower = status.toLowerCase();
      return lower.startsWith("run");
    } else {
      return false;
    }
  }

  /**
   * Returns true if the labels object has all of the key/value pairs from the selector
   */
  export function selectorMatches(selector, labels) {
    if (angular.isObject(labels)) {
      var answer = true;
      var count = 0;
      angular.forEach(selector, (value, key) => {
        count++;
        if (answer && labels[key] !== value) {
          answer = false;
        }
      });
      return answer && count > 0;
    } else {
      return false;
    }
  }

  /**
   * Returns the service registry
   */
  export function getServiceRegistry() {
    var injector = HawtioCore.injector;
    return injector ? injector.get<any>("ServiceRegistry") : null;
  }


  /**
   * Returns a link to the kibana logs web application
   */
  export function kibanaLogsLink(ServiceRegistry) {
    var link = ServiceRegistry.serviceLink(kibanaServiceName);
    if (link) {
      if (!link.endsWith("/")) {
        link += "/";
      }
      return link + "#/dashboard/Fabric8";
    } else {
      return null;
    }
  }

  export function openLogsForPods(ServiceRegistry, $window, namespace, pods) {
    var link = kibanaLogsLink(ServiceRegistry);
    if (link) {
      var query = "";
      var count = 0;
      angular.forEach(pods, (item) => {
        var id = getName(item);
        if (id) {
          var space = query ? " OR " : "";
          count++;
          query += space + '"' + id + '"';
        }
      });
      if (query) {
        if (count > 1) {
          query = "(" + query + ")";
        }
        query = 'kubernetes.namespace_name:"' + namespace + '" AND kubernetes.pod_name:' + query;
        link += "?_a=(query:(query_string:(query:'" + query + "')))";
        var newWindow = $window.open(link, "viewLogs");
      }
    }
  }

  export function resizeController($http, KubernetesApiURL, replicationController, newReplicas, onCompleteFn = null) {
    var id = getName(replicationController);
    var namespace = getNamespace(replicationController) || "";
    var kind = getKind(replicationController) || "ReplicationController";
    var url = kubernetesUrlForKind(KubernetesApiURL, kind, namespace, id);

    $http.get(url).
      success(function (data, status, headers, config) {
        if (data) {
          var desiredState = data.spec;
          if (!desiredState) {
            desiredState = {};
            data.spec = desiredState;
          }
          desiredState.replicas = newReplicas;
          $http.put(url, data).
            success(function (data, status, headers, config) {
              log.debug("updated controller " + url);
              if (angular.isFunction(onCompleteFn)) {
                onCompleteFn();
              }
            }).
          error(function (data, status, headers, config) {
            log.warn("Failed to save " + url + " " + data + " " + status);
          });
        }
      }).
      error(function (data, status, headers, config) {
        log.warn("Failed to load " + url + " " + data + " " + status);
      });
  }

  export function statusTextToCssClass(pod:any) {
    var text = getStatus(pod);
    if (text) {
      var lower = text.toLowerCase();
      if (_.startsWith(lower, "run") || _.startsWith(lower, "ok")) {
        if (pod.metadata.deletionTimestamp) {
          // Terminating ...
          return 'fa fa-times text-danger';
        }
        let ready = ('$ready' in pod) ? pod.$ready : isReady(pod);
        if (!ready) {
          return "fa fa-spinner fa-spin text-muted";
        }
        return 'fa fa-play-circle green';
      } else if (_.startsWith(lower, "wait") || _.startsWith(lower, "pend")) {
        if (!pod.$events) {
          // Scheduling...
          return 'fa fa-clock-o';
        }
        let containers = _.groupBy(pod.$events, (event:any) => event.fieldPath);
        if (_.every(containers, events => _.some(events, {reason: 'Started'}))) {
          // Started ...
          return 'fa fa-spinner fa-spin text-muted';
        } else if (_.every(containers, events => _.some(events, {reason: 'Created'}))) {
          // Starting ...
          return 'fa fa-cog fa-spin';
        } else if (_.every(containers, events => _.some(events, {reason: 'Pulled'}))) {
          // Creating ...
          return 'fa fa-cog';
        } else if (_.every(containers, events => _.some(events, {reason: 'Scheduled'}))) {
          // Pulling ...
          return 'fa fa-download';
        }
      } else if (_.startsWith(lower, "term") || _.startsWith(lower, "error") || _.startsWith(lower, "fail")) {
        return 'fa fa-power-off orange';
      } else if (_.startsWith(lower, "succeeded")) {
        return 'fa fa-check-circle-o green';
      }
    }
    return 'fa fa-question red';
  }

  export function podStatus(pod) {
    return getStatus(pod);
  }

  export function isReady(pod) {
    var status = pod.status || {};
    var answer = false;
    angular.forEach(status.conditions, (condition) => {
      var t = condition.type;
      if (t && t === "Ready") {
        var status = condition.status;
        if (status === "True") {
          answer = true;
        }
      }
    });
    return answer;
  }

  export function createAppViewPodCounters(appView) {
    var array = [];
    var map = {};
    var pods = appView.pods;
    var lowestDate = null;
    angular.forEach(pods, pod => {
      var selector = getLabels(pod);
      var selectorText = Kubernetes.labelsToString(selector, " ");
      var answer = map[selector];
      if (!answer) {
        answer = {
          labelText: selectorText,
          podsLink: UrlHelpers.join(HawtioCore.documentBase(), "/kubernetes/namespace/", pod.metadata.namespace, "pods?q=" + encodeURIComponent(selectorText)),
          valid: 0,
          waiting: 0,
          error: 0
        };
        map[selector] = answer;
        array.push(answer);
      }
      var status = (podStatus(pod) || "Error").toLowerCase();
      if (status.startsWith("run") || status.startsWith("ok")) {
        answer.valid += 1;
      } else if (status.startsWith("wait") || status.startsWith("pwnd")) {
        answer.waiting += 1;
      } else {
        answer.error += 1;
      }
      var creationTimestamp = getCreationTimestamp(pod);
      if (creationTimestamp) {
        var d = new Date(creationTimestamp);
        if (!lowestDate || d < lowestDate) {
          lowestDate = d;
        }
      }
    });
    appView.$creationDate = lowestDate;
    return array;
  }

  export function createAppViewServiceViews(appView) {
    var array = [];
    var pods = appView.pods;
    angular.forEach(pods, pod => {
      var id = getName(pod);
      if (id) {
        var abbrev = id;
        var idx = id.indexOf("-");
        if (idx > 1) {
          abbrev = id.substring(0, idx);
        }
        pod.idAbbrev = abbrev;
      }
      pod.statusClass = statusTextToCssClass(pod);
    });

    var services = appView.services || [];
    // Prefer the deployment but fall back to the RC/ReplicaSet
    var replicationControllers = appView.deployments || appView.replicationControllers || [];
    var size = Math.max(services.length, replicationControllers.length, 1);
    var appName = appView.$info.name;
    for (var i = 0; i < size; i++) {
      var service = services[i];
      var replicationController = replicationControllers[i];
      var controllerId = getName(replicationController);
      var name = getName(service) || controllerId;
      var address = Core.pathGet(service, ["spec", "portalIP"]);
      if (!name && pods.length) {
        name = pods[0].idAbbrev;
      }
      if (!appView.$info.name) {
        appView.$info.name = name;
      }
      if (!appView.id && pods.length) {
        appView.id = getName(pods[0]);
      }
      if (i > 0) {
        appName = name;
      }
      var podCount = pods.length;
      var podCountText = podCount + " pod" + (podCount > 1 ? "s" : "");
      var view = {
        appName: appName || name,
        name: name,
        createdDate: appView.$creationDate,
        podCount: podCount,
        podCountText: podCountText,
        address: address,
        controllerId: controllerId,
        service: service,
        replicationController: replicationController,
        pods: pods,
        configmaps: appView.configmaps || []
      };
      array.push(view);
    }
    return array;
  }

  /**
   * converts a git path into an accessible URL for the browser
   */
  export function gitPathToUrl(iconPath, branch = "master") {
    return (HawtioCore.injector.get<string>('AppLibraryURL') || '') + "/git/" + branch + iconPath;
  }

  function asDate(value) {
    return value ? new Date(value) : null;
  }

  export function enrichBuildConfig(buildConfig, sortedBuilds) {
    if (buildConfig) {
      var triggerUrl:string = null;
      var metadata = buildConfig.metadata || {};
      var name = metadata.name;
      buildConfig.$name = name;
      var projectLink = Developer.projectLink(name);
      var ns = metadata.namespace || currentKubernetesNamespace();
      buildConfig.$namespace = ns;
      buildConfig.environments = [];
      buildConfig.$creationDate = asDate(Kubernetes.getCreationTimestamp(buildConfig));
      buildConfig.$labelsText = Kubernetes.labelsToString(getLabels(buildConfig));

      if (name) {
        buildConfig.$viewLink = UrlHelpers.join("workspaces", ns, "projects", name, "environments");
        buildConfig.$editLink = UrlHelpers.join("workspaces", ns, "projects", name, "buildConfigEdit");

        angular.forEach([false, true], (flag) => {
          angular.forEach(buildConfig.triggers, (trigger) => {
            if (!triggerUrl) {
              var type = trigger.type;
              if (type === "generic" || flag) {
                var generic = trigger[type];
                if (type && generic) {
                  var secret = generic.secret;
                  if (secret) {
                    triggerUrl = UrlHelpers.join(buildConfigHooksRestURL(), name, secret, type);
                    buildConfig.$triggerUrl = triggerUrl;
                  }
                }
              }
            }
          });
        });

        // lets find the latest build...
        if (sortedBuilds) {
          buildConfig.$lastBuild = _.find(sortedBuilds, {
            metadata: {
              labels: {
                buildconfig: name
              }
            }
          });
        }
      }
      var $fabric8Views = {};

      function defaultPropertiesIfNotExist(name, object, autoCreate = false) {
        var view = $fabric8Views[name];
        if (autoCreate && !view) {
          view = {}
          $fabric8Views[name] = view;
        }
        if (view) {
          angular.forEach(object, (value, property) => {
            var current = view[property];
            if (!current) {
              view[property] = value;
            }
          });
        }
      }

      function defaultPropertiesIfNotExistStartsWith(prefix, object, autoCreate = false) {
        angular.forEach($fabric8Views, (view, name) => {
          if (view && name.startsWith(prefix)) {
            angular.forEach(object, (value, property) => {
              var current = view[property];
              if (!current) {
                view[property] = value;
              }
            });
          }
        });
      }

      var labels = metadata.labels || {};
      var annotations = metadata.annotations || {};

      // lets default the repo and user
      buildConfig.$user = annotations["fabric8.jenkins/user"] || labels["user"];
      buildConfig.$repo = annotations["fabric8.jenkins/repo"] || labels["repo"];

      var jenkinsBuildUrl = "";
      var jenkinsLink = Kubernetes.serviceLinkUrl("jenkins", true);
      var jenkinsBuildPath = annotations["fabric8.io/jenkins-url-path"];
      if (jenkinsLink && jenkinsBuildPath) {
        jenkinsBuildUrl = UrlHelpers.join(jenkinsLink, jenkinsBuildPath);
      }
      buildConfig.$buildUrl = annotations["fabric8.io/build-url"] || jenkinsBuildUrl || buildConfig.$buildUrl;

      angular.forEach(annotations, (value, key) => {
        var parts = key.split('/', 2);
        if (parts.length > 1) {
          var linkId = parts[0];
          var property = parts[1];
          if (linkId && property && linkId.startsWith("fabric8.link")) {
            var link = $fabric8Views[linkId];
            if (!link) {
              link = {
                class: linkId
              };
              $fabric8Views[linkId] = link;
            }
            link[property] = value;
          }
        }
      });

      if (buildConfig.$user && buildConfig.$repo) {
        // browse gogs repo view
        var gogsUrl = serviceLinkUrl(gogsServiceName);
        if (gogsUrl) {
          defaultPropertiesIfNotExist("fabric8.link.browseGogs.view", {
            label: "Browse...",
            url: UrlHelpers.join(gogsUrl, buildConfig.$user, buildConfig.$repo),
            description: "Browse the source code of this repository",
            iconClass: "fa fa-external-link"
          }, true);
        }

        // run forge commands view
        defaultPropertiesIfNotExist("fabric8.link.forgeCommand.view", {
          label: "Command...",
          url: UrlHelpers.join(projectLink, "/forge/commands/user", buildConfig.$user, buildConfig.$repo),
          description: "Perform an action on this project",
          iconClass: "fa fa-play-circle"
        }, true);


        // configure devops view
        defaultPropertiesIfNotExist("fabric8.link.forgeCommand.devops.settings", {
          label: "Settings",
          url: UrlHelpers.join(projectLink, "/forge/command/devops-edit/user", buildConfig.$user, buildConfig.$repo),
          description: "Configure the DevOps settings for this project",
          iconClass: "fa fa-pencil-square-o"
        }, true);

      }

      // add some icons and descriptions
      defaultPropertiesIfNotExist("fabric8.link.repository.browse", {
        label: "Browse...",
        description: "Browse the source code of this repository",
        iconClass: "fa fa-external-link"
      });
      defaultPropertiesIfNotExist("fabric8.link.jenkins.job", {
        iconClass: "fa fa-tasks",
        description: "View the Jenkins Job for this build"
      });
      defaultPropertiesIfNotExist("fabric8.link.jenkins.monitor", {
        iconClass: "fa fa-tachometer",
        description: "View the Jenkins Monitor dashboard for this project"
      });
      defaultPropertiesIfNotExist("fabric8.link.jenkins.pipeline", {
        iconClass: "fa fa-arrow-circle-o-right",
        description: "View the Jenkins Pipeline for this project"
      });
      defaultPropertiesIfNotExist("fabric8.link.letschat.room", {
        iconClass: "fa fa-comment",
        description: "Chat room for this project"
      });
      defaultPropertiesIfNotExist("fabric8.link.letschat.room", {
        iconClass: "fa fa-comment",
        description: "Chat room for this project"
      });
      defaultPropertiesIfNotExist("fabric8.link.taiga", {
        iconClass: "fa fa-check-square-o",
        description: "Issue tracker for this project"
      });
      defaultPropertiesIfNotExist("fabric8.link.issues", {
        iconClass: "fa fa-check-square-o",
        description: "Issues for this project"
      });
      defaultPropertiesIfNotExist("fabric8.link.releases", {
        iconClass: "fa fa-tag",
        description: "Issues for this project"
      });
      defaultPropertiesIfNotExist("fabric8.link.taiga.team", {
        iconClass: "fa fa-users",
        description: "Team members for this project"
      });
      defaultPropertiesIfNotExist("fabric8.link.team", {
        iconClass: "fa fa-users",
        description: "Team members for this project"
      });
      defaultPropertiesIfNotExistStartsWith("fabric8.link.environment.", {
        iconClass: "fa fa-cloud",
        description: "The kubernetes namespace for this environment"
      });


      // lets put the views into sections...
      var $fabric8CodeViews = {};
      var $fabric8BuildViews = {};
      var $fabric8TeamViews = {};
      var $fabric8EnvironmentViews = {};
      angular.forEach($fabric8Views, (value, key) => {
        var view;
        if (key.indexOf("taiga") > 0 || key.indexOf(".issue") > 0 || key.indexOf("letschat") > 0|| key.indexOf(".team") > 0) {
          view = $fabric8TeamViews;
        } else if (key.indexOf("jenkins") > 0) {
          view = $fabric8BuildViews;
        } else if (key.indexOf(".environment.") > 0) {
          view = $fabric8EnvironmentViews;
        } else {
          view = $fabric8CodeViews;
        }
        view[key] = value;
      });


      buildConfig.$fabric8Views = $fabric8Views;
      buildConfig.$fabric8CodeViews = $fabric8CodeViews;
      buildConfig.$fabric8BuildViews = $fabric8BuildViews;
      buildConfig.$fabric8EnvironmentViews = $fabric8EnvironmentViews;
      buildConfig.$fabric8TeamViews = $fabric8TeamViews;

      var $jenkinsJob = annotations["fabric8.io/jenkins-job"];
      if (!$jenkinsJob && ($fabric8Views["fabric8.link.jenkins.job"] || jenkinsBuildPath)) {
        $jenkinsJob = name;
      }
      buildConfig.$jenkinsJob = $jenkinsJob;

      angular.forEach($fabric8EnvironmentViews, (env) => {
        var c = env.class;
        var prefix = "fabric8.link.environment.";
        if (c && c.startsWith(prefix)) {
          var ens = c.substring(prefix.length);
          env.namespace = ens;
          env.url = UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", ns, "projects", name, "namespace", ens);
        }
        buildConfig.environments.push(env);
      });
      if (!buildConfig.environments.length) {
        // lets create a single environment
        var ens = ns;
        var env = {
          namespace: ens,
          label: "Current",
          description: "The environment that this project is built and run inside",
          iconClass: "fa fa-cloud",
          url: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", ns, "projects", name, "namespace", ens)
        };
        buildConfig.environments.push(env);

      }

      buildConfig.environments = buildConfig.environments.reverse();

      buildConfig.tools = [];
      angular.forEach($fabric8CodeViews, (env) => {
        buildConfig.tools.push(env);
      });
      angular.forEach($fabric8TeamViews, (env) => {
        buildConfig.tools.push(env);
      });

    }
  }

  export function enrichBuildConfigs(buildConfigs, sortedBuilds = null) {
    angular.forEach(buildConfigs, (buildConfig) => {
      enrichBuildConfig(buildConfig, sortedBuilds);
    });
    return buildConfigs;
  }

  export function enrichBuilds(builds) {
    angular.forEach(builds, (build) => {
      enrichBuild(build);
    });
    return _.sortBy(builds, "$creationDate").reverse();
  }

  export function enrichBuild(build) {
    if (build) {
      var metadata = build.metadata || {};
      var annotations = metadata.annotations || {};
      var name = getName(build);
      var namespace = getNamespace(build);
      build.$name = name;
      build.$namespace = namespace;

      var nameArray = name.split("-");
      var nameArrayLength = nameArray.length;
      build.$shortName = (nameArrayLength > 4) ? nameArray.slice(0, nameArrayLength - 4).join("-") : name.substring(0, 30);

      var labels = getLabels(build);
      var configId = labels.buildconfig;
      build.$configId = configId;
      if (configId) {
        //build.$configLink = UrlHelpers.join("kubernetes/buildConfigs", configId);
        build.$configLink = UrlHelpers.join("workspaces", currentKubernetesNamespace(), "projects", configId);
      }
      var creationTimestamp = getCreationTimestamp(build);
      if (creationTimestamp) {
        var d = new Date(creationTimestamp);
        build.$creationDate = d;
      }
      if (name) {
        //build.$viewLink = UrlHelpers.join("kubernetes/builds", name);
        var projectLink = UrlHelpers.join("workspaces", currentKubernetesNamespace(), "projects", configId);
        build.$viewLink = UrlHelpers.join(projectLink, "builds", name);
        //build.$logsLink = UrlHelpers.join("kubernetes/buildLogs", name);
        build.$logsLink = UrlHelpers.join(projectLink, "buildLogs", name);
      }
      build.podName = build.podName || annotations["openshift.io/build.pod-name"];
      var podName = build.podName;
      if (podName && namespace) {
        var podNameArray = podName.split("-");
        var podNameArrayLength = podNameArray.length;
        build.$podShortName = (podNameArrayLength > 5) ? podNameArray[podNameArrayLength - 5] : podName.substring(0, 30);
        build.$podLink = UrlHelpers.join("kubernetes/namespace", namespace, "pods", podName);
      }
    }
    return build;
  }


  export function enrichDeploymentConfig(deploymentConfig) {
    if (deploymentConfig) {
      var triggerUrl:string = null;
      var name = Core.pathGet(deploymentConfig, ["metadata", "name"]);
      deploymentConfig.$name = name;
      var found = false;
      angular.forEach(deploymentConfig.triggers, (trigger) => {
        var type = trigger.type;
        if (!deploymentConfig.$imageChangeParams && type === "ImageChange") {
          var imageChangeParams = trigger.imageChangeParams;
          if (imageChangeParams) {
            var containerNames = imageChangeParams.containerNames || [];
            imageChangeParams.$containerNames = containerNames.join(" ");
            deploymentConfig.$imageChangeParams = imageChangeParams;
          }
        }
      });
    }
  }

  export function enrichDeploymentConfigs(deploymentConfigs) {
    angular.forEach(deploymentConfigs, (deploymentConfig) => {
      enrichDeploymentConfig(deploymentConfig);
    });
    return deploymentConfigs;
  }


  export function enrichEvent(event) {
    if (event) {
      var metadata = event.metadata || {};

      var firstTimestamp = event.firstTimestamp;
      if (firstTimestamp) {
        var d = new Date(firstTimestamp);
        event.$firstTimestamp = d;
      }
      var lastTimestamp = event.lastTimestamp;
      if (lastTimestamp) {
        var d = new Date(lastTimestamp);
        event.$lastTimestamp = d;
      }
      var labels = angular.copy(event.source || {});
      var involvedObject = event.involvedObject || {};
      var name = involvedObject.name;
      var kind = involvedObject.kind;
      if (name) {
        labels['name'] = name;
      }
      if (kind) {
        labels['kind'] = kind;
      }
      event.$labelsText = Kubernetes.labelsToString(labels);

    }
  }

  export function enrichEvents(events, model = null) {
    angular.forEach(events, (event) => {
      enrichEvent(event);
    });

    // lets update links to the events for each pod and RC
    if (model) {
      function clearEvents(entity) {
        entity.$events = [];
        entity.$eventsLink = null;
        entity.$eventCount = 0;
      }

      function updateEvent(entity, event) {
        if (entity) {
          if (!entity.$events) {
            entity.$events = [];
          }
          entity.$events.push(event);
          if (!entity.$eventsLink) {
            entity.$eventsLink = UrlHelpers.join(HawtioCore.documentBase(), "/kubernetes/namespace/", currentKubernetesNamespace(), "events") + "?q=kind%3D" + entity.kind + "%20name%3D" + entity.metadata.name;
          }
          entity.$eventCount = entity.$events.length;
        }
      }

      var pods = model.pods || [];
      var rcs = model.replicationControllers || [];
      angular.forEach(pods, clearEvents);
      angular.forEach(rcs, clearEvents);

      angular.forEach(events, (event) => {
        var involvedObject = event.involvedObject || {};
        var name = involvedObject.name;
        var kind = involvedObject.kind;
        var ns = model.currentNamespace();
        if (name && kind && ns) {
          var entity = null;
          if (kind === "ReplicationController" || kind === "ReplicaSet") {
            entity = model.getReplicationController(ns, name);
          } else if (kind === "Pod") {
            entity = model.getPod(ns, name);
          } else if (kind === "Deployment") {
            entity = model.getDeployment(ns, name);
          }
          if (entity) {
            updateEvent(entity, event);
          }
        }
      });
    }
    return events;
  }

  export function enrichImageRepository(imageRepository) {
    if (imageRepository) {
      var triggerUrl:string = null;
      var name = Core.pathGet(imageRepository, ["metadata", "name"]);
      imageRepository.$name = name;
    }
  }

  export function enrichImageRepositories(imageRepositories) {
    angular.forEach(imageRepositories, (imageRepository) => {
      enrichImageRepository(imageRepository);
    });
    return imageRepositories;
  }

  var labelColors = {
    'version': 'k8s-badge-version',
    'project': 'k8s-badge-project',
    'package': 'k8s-badge-package'
  };

  export function containerLabelClass(labelType:string) {
    if (!(labelType in labelColors)) {
      return 'mouse-pointer';
    }
    else return labelColors[labelType] + ' mouse-pointer';
  }


  /**
   * Returns true if the fabric8 forge plugin is enabled
   */
  export function isForgeEnabled() {
    // TODO should return true if the service "fabric8-forge" is valid
    return true;
  }

  /**
   * Returns the current kubernetes selected namespace or the default one
   */
  export function currentKubernetesNamespace() {
    var injector = HawtioCore.injector;
    if (injector) {
      var KubernetesState = injector.get<any>("KubernetesState") || {};
      return KubernetesState.selectedNamespace || defaultNamespace;
    }
    return defaultNamespace;
  }

  export function setCurrentKubernetesNamespace(ns) {
    if (ns) {
      var KubernetesState = inject<any>("KubernetesState") || {};
      KubernetesState.selectedNamespace = ns;
    }
  }

  /**
   * Configures the json schema
   */
  export function configureSchema() {
    angular.forEach(schema.definitions, (definition, name) => {
      var properties = definition.properties;
      if (properties) {
        var hideProperties = ["creationTimestamp", "kind", "apiVersion", "annotations", "additionalProperties", "namespace", "resourceVersion", "selfLink", "uid"];
        angular.forEach(hideProperties, (propertyName) => {
          var property = properties[propertyName];
          if (property) {
            property["hidden"]  = true;
          }
        });
        angular.forEach(properties, (property, propertyName) => {
          var ref = property["$ref"];
          var type = property["type"];
          if (ref && (!type || type === "object")) {
            property["type"] = ref;
          }
          if (type === "array") {
            var items = property["items"];
            if (items) {
              var ref = items["$ref"];
              var type = items["type"];
              if (ref && (!type || type === "object")) {
                items["type"] = ref;
              }
            }
          }
        });
      }

      schema.definitions.os_build_WebHookTrigger.properties.secret.type = "password";
    })
  }

  /**
   * Lets remove any enriched data to leave the original json intact
   */
  export function unenrich(item) {
    if (!item) {
      return item;
    }
    var o = _.cloneDeep(item);
    angular.forEach(o, (value, key) => {
      if (key.startsWith("$") || key.startsWith("_")) {
        delete o[key];
      }
    });
    delete o['connectTo'];
    return o;
  }

  /**
   * Returns the unenriched JSON representation of an object
   */
  export function toRawJson(item) {
    var o = unenrich(item);
    return JSON.stringify(o, null, 2); // spacing level = 2
  }

  /**
   * Returns the unenriched YAML representation of an object
   */
  export function toRawYaml(item) {
    var o = unenrich(item);
    return jsyaml.dump(o, { indent: 2 });
  }


  /**
   * Helper function to set up a KubernetesAPI watch and automatically
   * close the watch when the view closes
   */
  export function watch($scope: any, $element: any, kind, ns, fn, labelSelector = null) {
    var connectionName = ns + '-' + kind;
    var connections:any = $scope.connections || {};
    if (connections) {
      var connection = connections[connectionName];
      if (connection) {
        log.info("Existing connection open on this scope, not creating watch for ", connectionName);
        return;
      }
    }
    var connection:any = KubernetesAPI.watch({
    kind: kind,
    namespace: ns,
    labelSelector: labelSelector,
    success: function (objects) {
      fn(objects);
      Core.$apply($scope);
    },
    error: (err) => {
      log.debug("Error fetching objects for kind: ", kind, " in namespace: ", ns, " : ", err);
      fn([]);
      Core.$apply($scope);
    }
    });
    // cache the connection in the scope
    connections[connectionName] = connection;
    $scope.connections = connections;
    $element.on('$destroy', () => {
      log.debug("Static controller[" + kind + ", " + ns + "] element destroyed");
      var scope = $element.scope();
      angular.forEach(scope.connections, (connection:any, key) => {
        if (connection && connection.disconnect) {
          connection.disconnect();
          delete $scope.connections[key];
          log.debug("connection[" + key + "] destroyed");
        }
      });
    });
    var oldDeleteScopeFn = $scope.deleteScope;
    $scope.deleteScope = function () {
      $element.remove();
      if (angular.isFunction(oldDeleteScopeFn)) {
        oldDeleteScopeFn();
      }
    }
    return connection;
  }

  /**
   * Helper wrapper to create a KubernetesAPI client instance, for
   * simple puts/deletes though use KubernetesAPI.put() or
   * KubernetesAPI.del()
   */
  export function createKubernetesClient(kind, ns = null) {
    var K8SClientFactory = inject<any>("K8SClientFactory");
    if (!K8SClientFactory) {
      log.warn("Could not find injected K8SClientFactory!");
      return null;
    }
    if (kind === "projects" || kind === "namespaces") {
      ns = null;
    } else if (!ns) {
      ns = Kubernetes.currentKubernetesNamespace();
    }
    return K8SClientFactory.create(kind, ns);
  }

  export function destroyKubernetesClient(client) {
    var K8SClientFactory = inject<any>("K8SClientFactory");
    if (!K8SClientFactory) {
      log.warn("Could not find injected K8SClientFactory!");
      return null;
    }
    return K8SClientFactory.destroy(client);
  }


  export function currentUserName() {
    var userDetails = HawtioOAuth.getUserProfile();
    var answer = null;
    if (userDetails) {
      answer = getName(userDetails);
    }
    return answer || "admin";
  }

  export function getNamespaceKind() {
    return isOpenShift ? KubernetesAPI.WatchTypes.PROJECTS : KubernetesAPI.WatchTypes.NAMESPACES;
  }

  export function newNamespaceObject(namespace:string) {
    return <any> {
      apiVersion: Kubernetes.defaultApiVersion,
      kind: KubernetesAPI.toKindName(getNamespaceKind()),
      metadata: {
        name: namespace,
        labels: {}
      }
    }
  }

  export function deleteNamespace(ns, client?, success?:(data:any) => void, error?:(err:any) => void) {
    if (!ns) {
      throw "Null value provided for namespace name";
    }
    var namespace = ns;
    if (angular.isString(ns)) {
      namespace = newNamespaceObject(ns);      
    }
    var _success = (data) => {
      log.info("Deleted namespace: ", data);
      if (success) {
        success(data);
      }
    }
    var _error = (err) => {
      log.info("Failed to delete namespace: ", err);
      if (error) {
        error(err);
      }
    }
    if (client) {
      client.delete(namespace, _success, _error);
    } else {
      KubernetesAPI.del({
        apiVersion: Kubernetes.defaultApiVersion,
        kind: getNamespaceKind(),
        object: namespace,
        success: _success,
        error: _error
      });
    }
  }

  export function createNamespace(ns, client?, success?:(data:any) => void, error?:(err:any) => void) {
    if (!ns) {
      throw "Null value provided for namespace name";
    }
    if (ns !== currentKubernetesNamespace()) {
      var namespace:any = newNamespaceObject(ns);
      var _success = (data) => {
          log.info("Created namespace: " + ns)
          if (success) {
            success(data);
          }
        };
      var _error = (err) => {
          log.warn("Failed to create namespace: " + ns + ": " + angular.toJson(err));
          if (error) {
            error(err);
          }
        };
      if (client) {
        client.put(namespace, _success, _error);
      } else {
        KubernetesAPI.put({
          object: namespace, 
          success: _success, 
          error: _error
        });
      }
    }
  }
}
