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

    public defaultIconUrl = Core.url("/img/icons/kubernetes.svg");

    public fetched = false;

    public fetch = () => {
    };

    public orRedraw(flag) {
      this.redraw = this.redraw || flag;
    }

    public maybeInit() {
      if (this.services && this.replicationControllers && this.pods) {
        this.servicesByKey = {};
        this.podsByKey = {};
        this.replicationControllersByKey = {};
        this.kubernetes.namespaces = {};
        this.services.forEach((service) => {
          this.servicesByKey[service._key] = service;
          var selectedPods = selectPods(this.pods, service.namespace, service.selector);
          service.connectTo = selectedPods.map((pod) => {
            return pod._key;
          }).join(',');

          var selector = service.selector;
          service.$podCounters = selector ? createPodCounters(selector, this.pods) : null;
        });
        this.replicationControllers.forEach((replicationController) => {
          this.replicationControllersByKey[replicationController._key] = replicationController
          var selectedPods = selectPods(this.pods, replicationController.namespace, replicationController.desiredState.replicaSelector);
          replicationController.connectTo = selectedPods.map((pod) => {
            return pod._key;
          }).join(',');
        });
        var hostsByKey = {};
        this.pods.forEach((pod) => {
          this.podsByKey[pod._key] = pod;
          var host = pod.currentState.host;
          hostsByKey[host] = hostsByKey[host] || [];
          hostsByKey[host].push(pod);

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
        appViews.push({
          appPath: "/dummyPath",
          replicationControllers: [replicationController],
          pods: replicationController.pods || [],
          services: []
        });
      });

      this.appViews = appViews;
      if (this.appViews.length) {
        this.fetched = true;
      }
      if (this.appInfos && this.appViews) {
        var folderMap = {};
        var folders = [];
        var appMap = {};
        angular.forEach(this.appInfos, (appInfo) => {
          var appPath = appInfo.appPath;
          var iconPath = appInfo.iconPath;

          /*
           TODO
           if (iconPath) {
           appInfo.$iconUrl = Wiki.gitRelativeURL(branch, iconPath);
           } else {
           appInfo.$iconUrl = defaultIconUrl;
           }
           */
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
          $iconUrl: this.defaultIconUrl,
          name: ""
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

          var appInfo = defaultInfo;
          if (appPath) {
            appInfo = appMap[appPath] || defaultInfo;
          }
          appView.$info = appInfo;
          appView.id = appPath;
          appView.$name = appInfo.name;
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
        this.apps = apps;
      }

    }
  }


  /**
   * Creates a model service which keeps track of all the pods, replication controllers and services along
   * with their associations and status
   */
  export function createKubernetesModel(KubernetesState, KubernetesServices, KubernetesReplicationControllers, KubernetesPods) {
    var $scope = new KubernetesModelService();
    $scope.kubernetes = KubernetesState;


    KubernetesServices.then((KubernetesServices:ng.resource.IResourceClass) => {
      KubernetesReplicationControllers.then((KubernetesReplicationControllers:ng.resource.IResourceClass) => {
        KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {
          $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
            var ready = 0;
            var numServices = 3;

            function maybeNext(count) {
              ready = count;
              // log.debug("Completed: ", ready);
              if (ready >= numServices) {
                // log.debug("Fetching another round");
                $scope.maybeInit();
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