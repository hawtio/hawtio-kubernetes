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

    protected findIconUrl(id: string, nameField: string) {
      var answer = null;
      if (id && nameField) {
        (this.appInfos || []).forEach((appInfo) => {
          var iconPath = appInfo.iconPath;
          if (iconPath && !answer) {
            var iconUrl = (HawtioCore.injector.get('AppLibraryURL') || '') + "/git/master" + iconPath;
            var ids = Core.pathGet(appInfo, ["names", nameField]);
            angular.forEach(ids, (appId) => {
              if (appId === id) {
                answer = iconUrl;
              }
            });
          }
        });
      }
      return answer || defaultIconUrl;
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
        });

        this.services.forEach((service) => {
          this.servicesByKey[service._key] = service;
          var selectedPods = selectPods(this.pods, service.namespace, service.selector);
          service.connectTo = selectedPods.map((pod) => {
            return pod._key;
          }).join(',');
          var selector = service.selector;
          service.$labelsText = Kubernetes.labelsToString(service.labels);
          var iconUrl = this.findIconUrl(service.id, "serviceNames");
          service.$iconUrl = iconUrl;
          if (iconUrl && selectedPods) {
            selectedPods.forEach((pod) => {
              pod.$iconUrl = iconUrl;
            });
          }

          service.$pods = selectedPods;
          service.$podCounters = selector ? createPodCounters(selector, this.pods, service.$pods) : null;
        });

        this.replicationControllers.forEach((replicationController) => {
          this.replicationControllersByKey[replicationController._key] = replicationController
          var selectedPods = selectPods(this.pods, replicationController.namespace, replicationController.desiredState.replicaSelector);
          replicationController.connectTo = selectedPods.map((pod) => {
            return pod._key;
          }).join(',');
          replicationController.$labelsText = Kubernetes.labelsToString(replicationController.labels);
          var iconUrl = this.findIconUrl(replicationController.id, "replicationControllerNames");
          replicationController.$iconUrl = iconUrl;
          replicationController.$pods = selectedPods;
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
        appViews.push({
          appPath: "/dummyPath/" + name,
          $name: name,
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
          appViews.push({
            appPath: "/dummyPath/" + name,
            $name: name,
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
          appView.$info = defaultInfo;

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
          appView.$info = appInfo;
          appView.id = appPath;
          appView.$name = appInfo.name || appView.$name;
          appView.$iconUrl = appInfo.$iconUrl;

          /*
           TODO
           appView.$appUrl = Wiki.viewLink(branch, appPath, $location);
           */
          /*
           TODO
           appView.$openResizeControllerDialog = (controller) => {
           $scope.resize = {
           controller: controller,
           newReplicas: controller.replicas
           };
           $scope.resizeDialog.dialog.open();

           $timeout(() => {
           $('#replicas').focus();
           }, 50);
           };
           */
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
  export function createKubernetesModel($rootScope, $http, AppLibraryURL, KubernetesState, KubernetesServices, KubernetesReplicationControllers, KubernetesPods) {
    var $scope = new KubernetesModelService();
    $scope.kubernetes = KubernetesState;


    KubernetesServices.then((KubernetesServices:ng.resource.IResourceClass) => {
      KubernetesReplicationControllers.then((KubernetesReplicationControllers:ng.resource.IResourceClass) => {
        KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {
          $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
            var ready = 0;
            var numServices = 4;

            function maybeNext(count) {
              ready = count;
              // log.debug("Completed: ", ready);
              if (ready >= numServices) {
                // log.debug("Fetching another round");
                $scope.maybeInit();
                $rootScope.$broadcast('kubernetesModelUpdated');
                next();
              }
            }

            KubernetesServices.query((response) => {
              if (response) {
                var items = populateKeys((response.items || []).sortBy(byId));
                $scope.orRedraw(ArrayHelpers.sync($scope.services, items, "_key"));
              }
              maybeNext(ready + 1);
            });
            KubernetesReplicationControllers.query((response) => {
              if (response) {
                var items = populateKeys((response.items || []).sortBy(byId));
                $scope.orRedraw(ArrayHelpers.sync($scope.replicationControllers, items, "_key"));
              }
              maybeNext(ready + 1);
            });
            KubernetesPods.query((response) => {
              if (response) {
                var items = populateKeys((response.items || []).sortBy(byId));
                $scope.orRedraw(ArrayHelpers.sync($scope.pods, items, "_key"));
              }
              maybeNext(ready + 1);
            });

            var appsUrl = AppLibraryURL + "/apps";
            $http.get(appsUrl).
              success(function(data, status, headers, config) {
                if (data) {
                  $scope.appInfos = data;
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