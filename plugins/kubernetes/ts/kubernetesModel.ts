/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>

module Kubernetes {

  function byId(thing) {
    return thing.id;
  }

  function populateKey(item) {
    var result = item;
    result['_key'] = item.namespace + "-" + item.id;
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
      return pod.namespace === namespace && selectorMatches(labels, pod.labels);
    });
  }


  /**
   * The object which keeps track of all the pods, replication controllers, services and their associations
   */
  export class KubernetesModelService {
    public kubernetes = null;
    public apps = [];
    public services = [];
    public replicationControllers = [];
    public pods = [];
    public hosts = [];
    public redraw = false;
    public resourceVersions = {};

    // various views on the data
    public hostsByKey = {};
    public servicesByKey = {};
    public podsByKey = {};
    public replicationControllersByKey = {};

    public appInfos = [];
    public appViews = [];
    public appFolders = [];

    public fetched = false;

    public fetch = () => {
    };

    public $keepPolling() {
      return keepPollingModel;
    }

    public orRedraw(flag) {
      this.redraw = this.redraw || flag;
    }

    protected updateIconUrlAndAppInfo(entity, nameField: string) {
      var answer = null;
      var id = entity.id;
      if (id && nameField) {
        (this.appInfos || []).forEach((appInfo) => {
          var iconPath = appInfo.iconPath;
          if (iconPath && !answer) {
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
        this.kubernetes.namespaces = {};

        var hostsByKey = {};

        this.pods.forEach((pod) => {
          this.podsByKey[pod._key] = pod;
          var host = pod.currentState.host;
          hostsByKey[host] = hostsByKey[host] || [];
          hostsByKey[host].push(pod);
          pod.$labelsText = Kubernetes.labelsToString(pod.labels);
          pod.$iconUrl = defaultIconUrl;
          this.discoverPodConnections(pod);
          pod.$containerPorts = [];
          angular.forEach(Core.pathGet(pod, ["desiredState", "manifest", "containers"]), (container) => {
            angular.forEach(container.ports, (port) => {
              var containerPort = port.containerPort;
              if (containerPort) {
                pod.$containerPorts.push(containerPort);
              }
            });
          });
        });

        this.services.forEach((service) => {
          this.servicesByKey[service._key] = service;
          var selector = service.selector;
          service.$pods = [];
          service.$podCounters = selector ? createPodCounters(selector, this.pods, service.$pods) : null;
          var selectedPods = service.$pods;
          service.connectTo = selectedPods.map((pod) => {
            return pod._key;
          }).join(',');
          service.$labelsText = Kubernetes.labelsToString(service.labels);
          this.updateIconUrlAndAppInfo(service, "serviceNames");
          var iconUrl = service.$iconUrl;
          if (iconUrl && selectedPods) {
            selectedPods.forEach((pod) => {
              pod.$iconUrl = iconUrl;
            });
          }
        });

        this.replicationControllers.forEach((replicationController) => {
          this.replicationControllersByKey[replicationController._key] = replicationController
          var selector = replicationController.desiredState.replicaSelector;
          replicationController.$pods = [];
          replicationController.$podCounters = selector ? createPodCounters(selector, this.pods, replicationController.$pods) : null;
          var selectedPods = replicationController.$pods;
          replicationController.connectTo = selectedPods.map((pod) => {
            return pod._key;
          }).join(',');
          replicationController.$labelsText = Kubernetes.labelsToString(replicationController.labels);
          this.updateIconUrlAndAppInfo(replicationController, "replicationControllerNames");
          var iconUrl =  replicationController.$iconUrl;
          if (iconUrl && selectedPods) {
            selectedPods.forEach((pod) => {
              pod.$iconUrl = iconUrl;
            });
          }
        });
        var tmpHosts = [];
        var oldHostsLength = this.hosts.length;
        this.hostsByKey = hostsByKey;

        for (var hostKey in hostsByKey) {
          tmpHosts.push({
            id: hostKey,
            pods: hostsByKey[hostKey]
          });
        }

        this.orRedraw(ArrayHelpers.removeElements(this.hosts, tmpHosts));

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

        this.updateApps();

        updateNamespaces(this.kubernetes, this.pods, this.replicationControllers, this.services);

      }
    }

    protected updateApps() {
      // lets create the app views by trying to join controllers / services / pods that are related
      var appViews = [];

      this.replicationControllers.forEach((replicationController) => {
        var name = replicationController.name || replicationController.id;
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
            var repSelector = Core.pathGet(replicationController, ["desiredState", "replicaSelector"]);
            if (repSelector && selectorMatches(repSelector, service.selector) && service.namespace == replicationController.namespace) {
              matchesApp = appView;
            }
          });
        });

        if (matchesApp) {
          matchesApp.services.push(service);
        } else {
          var name = service.name || service.id;
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
      this.appViews = appViews;

      if (this.appInfos && this.appViews) {
        var folderMap = {};
        var folders = [];
        var appMap = {};
        angular.forEach(this.appInfos, (appInfo) => {
          if (!appInfo.$iconUrl) {
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
        });
        //this.apps = apps;
        this.apps = this.appViews;
      }
    }

    protected discoverPodConnections(entity) {
      var info = Core.pathGet(entity, ["currentState", "info"]);
      var hostPort = null;
      var currentState = entity.currentState || {};
      var desiredState = entity.desiredState || {};
      var host = currentState["host"];
      var podIP = currentState["podIP"];
      var hasDocker = false;
      var foundContainerPort = null;
      if (currentState && !podIP) {
        angular.forEach(info, (containerInfo, containerName) => {
          if (!hostPort) {
            var jolokiaHostPort = Core.pathGet(containerInfo, ["detailInfo", "HostConfig", "PortBindings", "8778/tcp"]);
            if (jolokiaHostPort) {
              var hostPorts = jolokiaHostPort.map("HostPort");
              if (hostPorts && hostPorts.length > 0) {
                hostPort = hostPorts[0];
                hasDocker = true;
              }
            }
          }
        });
      }
      if (desiredState && !hostPort) {
        var containers = Core.pathGet(desiredState, ["manifest", "containers"]);
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
      if (podIP && foundContainerPort) {
        host = podIP;
        hostPort = foundContainerPort;
        hasDocker = false;
      }
      if (hostPort) {
        if (!host) {
          host = "localhost";
        }
        // if Kubernetes is running locally on a platform which doesn't support docker natively
        // then docker containers will be on a different IP so lets check for localhost and
        // switch to the docker IP if its available
        // TODO
        var dockerIp = null;
        var currentHostName = null;
        if (dockerIp && hasDocker) {
          if (host === "localhost" || host === "127.0.0.1" || host === currentHostName) {
            host = dockerIp;
          }
        }
        if (isRunning(currentState)) {
          entity.$jolokiaUrl = "http://" + host + ":" + hostPort + "/jolokia/";

          // TODO note if we can't access the docker/local host we could try access via
          // the pod IP; but typically you need to explicitly enable that inside boot2docker
          // see: https://github.com/fabric8io/fabric8/blob/2.0/docs/getStarted.md#if-you-are-on-a-mac

          // TODO
          //entity.$connect = $scope.connect;
        }
      }
    }
  }


  /**
   * Creates a model service which keeps track of all the pods, replication controllers and services along
   * with their associations and status
   */
  export function createKubernetesModel($rootScope, $http, AppLibraryURL, KubernetesApiURL, KubernetesState, KubernetesServices, KubernetesReplicationControllers, KubernetesPods) {
    var $scope = new KubernetesModelService();
    $scope.kubernetes = KubernetesState;


    KubernetesServices.then((KubernetesServices:ng.resource.IResourceClass) => {
      KubernetesReplicationControllers.then((KubernetesReplicationControllers:ng.resource.IResourceClass) => {
        KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {
          $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
            var ready = 0;
            var numServices = 4;
            var dataChanged = false;
            var changedResourceVersion = null;

            function maybeNext(count) {
              ready = count;
              // log.debug("Completed: ", ready);
              if (ready >= numServices) {
                // log.debug("Fetching another round");
                if (dataChanged) {
                  log.debug("kube model changed: resourceVersion: " + changedResourceVersion);
                  $scope.maybeInit();
                  $rootScope.$broadcast('kubernetesModelUpdated');
                }
                next();
              }
            }

            function hasChanged(response, name) {
              var resourceVersion = response.resourceVersion;
              var lastResourceVersion = $scope.resourceVersions[name] || 0;
              if (!resourceVersion || resourceVersion > lastResourceVersion) {
                if (resourceVersion) {
                  $scope.resourceVersions[name] = resourceVersion;
                  changedResourceVersion = resourceVersion;
                }
                dataChanged = true;
                return true;
              }
              return false;
            }

            KubernetesServices.query((response) => {
              if (response && hasChanged(response, "services")) {
                var items = populateKeys((response.items || []).sortBy(byId));
                angular.forEach(items, (item) => {
                  kubernetesProxyUrlForService(KubernetesApiURL, item).then((url) => {
                    item.proxyUrl = url;
                  });
                });

                $scope.services = items;
                //$scope.orRedraw(ArrayHelpers.sync($scope.services, items, "_key"));
              }
              maybeNext(ready + 1);
            });
            KubernetesReplicationControllers.query((response) => {
              if (response && hasChanged(response, "replicationControllers")) {
                var items = populateKeys((response.items || []).sortBy(byId));
                $scope.replicationControllers = items;
                //$scope.orRedraw(ArrayHelpers.sync($scope.replicationControllers, items, "_key"));
              }
              maybeNext(ready + 1);
            });
            KubernetesPods.query((response) => {
              if (response && hasChanged(response, "pods")) {
                var items = populateKeys((response.items || []).sortBy(byId));
                $scope.pods = items;
                //$scope.orRedraw(ArrayHelpers.sync($scope.pods, items, "_key"));
              }
              maybeNext(ready + 1);
            });

            var appsUrl = AppLibraryURL + "/apps";
            var etags = $scope.resourceVersions["appLibrary"];
            $http.get(appsUrl, {
              headers: {
                "If-None-Match": etags
              }
            }).
              success(function(data, status, headers, config) {
                if (angular.isArray(data) && status === 200) {
                  var newETags = headers("etag") || headers("ETag");
                  if (!newETags || newETags !== etags) {
                    if (newETags) {
                      $scope.resourceVersions["appLibrary"] = newETags;
                    }
                    $scope.appInfos = data;
                    dataChanged = true;
                  }
                }
                maybeNext(ready + 1);
              }).
              error(function(data, status, headers, config) {
                maybeNext(ready + 1);
              });
          });
          $scope.fetch();
        });
      });
    });

    function selectPods(pods, namespace, labels) {
      return pods.filter((pod) => {
        return pod.namespace === namespace && selectorMatches(labels, pod.labels);
      });
    }
    return $scope;
  }

}
