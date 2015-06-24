/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  function byId(thing) {
    return thing.id;
  }

  function createKey(namespace, id) {
    return (namespace || "") + "-" + id;
  }

  function populateKey(item) {
    var result = item;
    result['_key'] = createKey(getNamespace(item), getName(item));
    return result;
  }

  function populateKeys(items:Array<any>) {
    var result = [];
    angular.forEach(items, (item) => {
      result.push(populateKey(item));
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
    public apps = [];
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
    //public namespaces = [];
    public routes = [];
    public templates = [];
    public redraw = false;
    public resourceVersions = {};

    // various views on the data
    public podsByHost = {};
    public servicesByKey = {};
    public replicationControllersByKey = {};
    public podsByKey = {};

    public appInfos = [];
    public appViews = [];
    public appFolders = [];

    public fetched = false;
    public isOpenShift = false;

    public fetch = () => {
    };

    public $keepPolling() {
      return keepPollingModel;
    }

    public orRedraw(flag) {
      this.redraw = this.redraw || flag;
    }

    public getService(namespace, id) {
      return this.servicesByKey[createKey(namespace ,id)];
    }

    public getReplicationController(namespace, id) {
      return this.replicationControllersByKey[createKey(namespace ,id)];
    }

    public getPod(namespace, id) {
      return this.podsByKey[createKey(namespace ,id)];
    }

    public podsForNamespace(namespace = this.currentNamespace()) {
      return _.filter(this.pods, { namespace: namespace });
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
      if (id && nameField) {
        (this.templates || []).forEach((template) => {
          var metadata = template.metadata;
          if (metadata) {
            var annotations = metadata.annotations || {};
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
        (this.appInfos || []).forEach((appInfo) => {
          var iconPath = appInfo.iconPath;
          if (iconPath && !answer && iconPath !== "null") {
            var iconUrl = gitPathToUrl(iconPath);
            var ids = Core.pathGet(appInfo, ["names", nameField]);
            angular.forEach(ids, (appId) => {
              if (appId === id) {
                entity.$iconUrl = iconUrl;
                entity.appPath = appInfo.appPath;
                entity.$info = appInfo;
              }
            });
          }
        });
      }
      if (!entity.$iconUrl) {
        entity.$iconUrl = defaultIconUrl;
      }
    }

    public maybeInit() {
      this.fetched = true;
      if (this.services && this.replicationControllers && this.pods) {
        this.servicesByKey = {};
        this.podsByKey = {};
        this.replicationControllersByKey = {};

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
          angular.forEach(Core.pathGet(pod, ["spec", "containers"]), (container) => {
            var image = container.image;
            if (image) {
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
        });

        this.services.forEach((service) => {
          if (!service.kind) service.kind = "Service";
          this.servicesByKey[service._key] = service;
          var selector = getSelector(service);
          service.$pods = [];
          if (!service.$podCounters) {
            service.$podCounters = {};
          }
          _.assign(service.$podCounters, selector ? createPodCounters(selector, this.pods, service.$pods) : {});
          var selectedPods = service.$pods;
          service.connectTo = selectedPods.map((pod) => {
            return pod._key;
          }).join(',');
          service.$labelsText = Kubernetes.labelsToString(getLabels(service));
          this.updateIconUrlAndAppInfo(service, "serviceNames");
          var spec = service.spec;
          if (spec) {
            var ports = _.map(spec.ports, "port");
            service.$ports = ports;
            service.$portsText = ports.join(", ");
          }
          var iconUrl = service.$iconUrl;
          if (iconUrl && selectedPods) {
            selectedPods.forEach((pod) => {
              pod.$iconUrl = iconUrl;
            });
          }
          service.$serviceUrl = serviceLinkUrl(service);
        });

        this.replicationControllers.forEach((replicationController) => {
          if (!replicationController.kind) replicationController.kind = "ReplicationController";
          this.replicationControllersByKey[replicationController._key] = replicationController
          var selector = getSelector(replicationController);
          replicationController.$pods = [];
          replicationController.$podCounters = selector ? createPodCounters(selector, this.pods, replicationController.$pods) : null;
          var selectedPods = replicationController.$pods;
          replicationController.connectTo = selectedPods.map((pod) => {
            return pod._key;
          }).join(',');
          replicationController.$labelsText = Kubernetes.labelsToString(getLabels(replicationController));
          this.updateIconUrlAndAppInfo(replicationController, "replicationControllerNames");
          var iconUrl =  replicationController.$iconUrl;
          if (iconUrl && selectedPods) {
            selectedPods.forEach((pod) => {
              pod.$iconUrl = iconUrl;
            });
          }
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

        this.updateApps();

        //updateNamespaces(this.kubernetes, this.pods, this.replicationControllers, this.services);

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

        this.hosts = tmpHosts;
/*
        tmpHosts.forEach((newHost) => {
          var oldHost:any = this.hosts.find((h) => {
            return h.id === newHost.id
          });
          if (!oldHost) {
            this.redraw = true;
            this.hosts.push(newHost);
          } else {
            this.orRedraw(ArrayHelpers.sync(oldHost.pods, newHost.pods));
          }
        });
*/
      }
    }

    protected updateApps() {
      try {
        // lets create the app views by trying to join controllers / services / pods that are related
        var appViews = [];

        this.replicationControllers.forEach((replicationController) => {
          var name = getName(replicationController);
          var $iconUrl = replicationController.$iconUrl;
          appViews.push({
            appPath: "/dummyPath/" + name,
            $name: name,
            $info: {
              $iconUrl: $iconUrl
            },
            $iconUrl: $iconUrl,
            replicationControllers: [replicationController],
            pods: replicationController.$pods || [],
            services: []
          });
        });

        this.services.forEach((service) => {
          // now lets see if we can find an app with an RC of the same selector
          var matchesApp = null;
          appViews.forEach((appView) => {
            appView.replicationControllers.forEach((replicationController) => {
              var repSelector = getSelector(replicationController);
              if (repSelector && selectorMatches(repSelector, getSelector(service)) && getNamespace(service) == getNamespace(replicationController)) {
                matchesApp = appView;
              }
            });
          });

          if (matchesApp) {
            matchesApp.services.push(service);
          } else {
            var name = getName(service);
            var $iconUrl = service.$iconUrl;
            appViews.push({
              appPath: "/dummyPath/" + name,
              $name: name,
              $info: {
                $iconUrl: $iconUrl
              },
              $iconUrl: $iconUrl,
              replicationControllers: [],
              pods: service.$pods || [],
              services: [service]
            });
          }
        });
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

              // TODO we could use some annotations / metadata to deduce what URL we should use to open this
              // service in the console. For now just assume its http:

              if (host) {
                var hostUrl =  host;
                if (hostUrl.indexOf("://") < 0) {
                  hostUrl = "http://" + host;
                }
                service.$connectUrl = UrlHelpers.join(hostUrl,  "/");
              }
            } else {
              log.debug("Could not find service " + serviceName + " namespace " + namespace + " for route: " + metadata.name);
            }
          }
        });

        appViews = populateKeys(appViews).sortBy((appView) => appView._key);

        ArrayHelpers.sync(this.appViews, appViews, '$name');

        if (this.appInfos && this.appViews) {
          var folderMap = {};
          var folders = [];
          var appMap = {};
          angular.forEach(this.appInfos, (appInfo) => {
            if (!appInfo.$iconUrl && appInfo.iconPath && appInfo.iconPath !== "null") {
              appInfo.$iconUrl = gitPathToUrl(appInfo.iconPath);
            }
            var appPath = appInfo.appPath;
            if (appPath) {
              appMap[appPath] = appInfo;
              var idx = appPath.lastIndexOf("/");
              var folderPath = "";
              if (idx >= 0) {
                folderPath = appPath.substring(0, idx);
              }
              folderPath = Core.trimLeading(folderPath, "/");
              var folder = folderMap[folderPath];
              if (!folder) {
                folder = {
                  path: folderPath,
                  expanded: true,
                  apps: []
                };
                folders.push(folder);
                folderMap[folderPath] = folder;
              }
              folder.apps.push(appInfo);
            }
          });
          this.appFolders = folders.sortBy("path");

          var apps = [];
          var defaultInfo = {
            $iconUrl: defaultIconUrl
          };

          angular.forEach(this.appViews, (appView) => {
            try {
              var appPath = appView.appPath;

              /*
               TODO
               appView.$select = () => {
               Kubernetes.setJson($scope, appView.id, $scope.model.apps);
               };
               */

              var appInfo = angular.copy(defaultInfo);
              if (appPath) {
                appInfo = appMap[appPath] || appInfo;
              }
              if (!appView.$info) {
                appView.$info = defaultInfo;
                appView.$info = appInfo;
              }
              appView.id = appPath;
              if (!appView.$name) {
                appView.$name = appInfo.name || appView.$name;
              }
              if (!appView.$iconUrl) {
                appView.$iconUrl = appInfo.$iconUrl;
              }
              apps.push(appView);
              appView.$podCounters = createAppViewPodCounters(appView);
              appView.$serviceViews = createAppViewServiceViews(appView);
            } catch (e) {
              log.warn("Failed to update appViews: " + e);
            }
          });
          //this.apps = apps;
          this.apps = this.appViews;
        }
      } catch (e) {
        log.warn("Caught error: " + e);
      }
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
        entity.$jolokiaUrl = UrlHelpers.join(Kubernetes.masterApiUrl(), "/api/", Kubernetes.defaultApiVersion, "namespaces", entity.metadata.namespace , "/pods/",
                                              podId + ":" + foundContainerPort, "/proxy/jolokia/");
      }
    }
  }

  /**
   * Creates a model service which keeps track of all the pods, replication controllers and services along
   * with their associations and status
   */
  _module.factory('KubernetesModel', ['$rootScope', '$http', 'KubernetesApiURL', 'KubernetesState', 'WatcherService', '$location', '$resource', ($rootScope, $http, AppLibraryURL, KubernetesState, watcher:WatcherService, $location:ng.ILocationService, $resource:ng.resource.IResourceService) => {

    var $scope = new KubernetesModelService();
    $scope.kubernetes = KubernetesState;

    // create all of our resource classes
    var typeNames = watcher.getTypes();
    _.forEach(typeNames, (type:string) => {
      var urlTemplate = '';
      switch (type) {
        case WatchTypes.NAMESPACES:
          urlTemplate = UrlHelpers.join('namespaces');
          break;
        default:
          urlTemplate = UrlHelpers.join('namespaces/:namespace', type, ':id');
      }
      $scope[type + 'Resource'] = createResource(type, urlTemplate, $resource, $scope);
    });

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
            $scope.isOpenShift = true;
            // don't put a break here :-)
					default:
						$scope[type] = populateKeys(objects[type]);
				}
        log.debug("Type: ", type, " object: ", $scope[type]);
			});
			$scope.maybeInit();
      $rootScope.$broadcast('kubernetesModelUpdated');
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
