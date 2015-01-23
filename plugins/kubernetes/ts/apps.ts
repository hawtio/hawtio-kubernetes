/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var Apps = controller("Apps",
    ["$scope", "KubernetesModel", "KubernetesServices", "KubernetesReplicationControllers", "KubernetesPods", "KubernetesState", "KubernetesApiURL", "$templateCache", "$location", "$routeParams", "$http", "$dialog", "$timeout", "workspace", "jolokia",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesServices:ng.IPromise<ng.resource.IResourceClass>, KubernetesReplicationControllers:ng.IPromise<ng.resource.IResourceClass>, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, KubernetesState, KubernetesApiURL,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $dialog, $timeout, workspace, jolokia:Jolokia.IJolokia) => {

    $scope.model = KubernetesModel;
    $scope.$on('kubernetesModelUpdated', function () {
      Core.$apply($scope);
    });

    $scope.namespace = $routeParams.namespace;
    $scope.apps = [];
    $scope.allApps = [];
    $scope.kubernetes = KubernetesState;
    $scope.fetched = false;
    $scope.json = '';
    ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);
    ControllerHelpers.bindModelToSearchParam($scope, $location, 'appSelectorShow', 'openApp', undefined);
    ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'detail');

    var branch = $scope.branch || "master";
    var namespace = null;

    function appMatches(app) {
      var filterText = $scope.appSelector.filterText;
      if (filterText) {
        return Core.matchFilterIgnoreCase(app.groupId, filterText) ||
          Core.matchFilterIgnoreCase(app.artifactId, filterText) ||
          Core.matchFilterIgnoreCase(app.name, filterText) ||
          Core.matchFilterIgnoreCase(app.description, filterText);
      } else {
        return true;
      }
    }

    function appRunning(app) {
      return $scope.model.apps.any((running) => running.appPath === app.appPath);
    }

    $scope.tableConfig = {
      data: 'model.apps',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      filterOptions: {
        filterText: $location.search()["q"] || ''
      },
      columnDefs: [
        { field: 'icon', displayName: 'App', cellTemplate: $templateCache.get("appIconTemplate.html") },
        { field: 'services', displayName: 'Services', cellTemplate: $templateCache.get("appServicesTemplate.html") },
        { field: 'replicationControllers', displayName: 'Controllers', cellTemplate: $templateCache.get("appReplicationControllerTemplate.html") },
        { field: '$podsLink', displayName: 'Pods', cellTemplate: $templateCache.get("appPodCountsAndLinkTemplate.html") },
        { field: '$deployedText', displayName: 'Deployed', cellTemplate: $templateCache.get("appDeployedTemplate.html") },
        { field: 'namespace', displayName: 'Namespace' }
      ]
    };

    Kubernetes.initShared($scope, $location);


    $scope.expandedPods = [];

    $scope.podExpanded = (pod) => {
      var id = (pod || {}).id;
      return id && ($scope.expandedPods || []).indexOf(id) >= 0;
    };

    $scope.expandPod = (pod) => {
      var id = pod.id;
      if (id) {
        $scope.expandedPods.push(id);
      }
    };

    $scope.collapsePod = (pod) => {
      var id = pod.id;
      if (id) {
        $scope.expandedPods = $scope.expandedPods.remove((v) => id === v);
      }
    };

    $scope.$on('$routeUpdate', ($event) => {
      Kubernetes.setJson($scope, $location.search()['_id'], $scope.model.apps);
    });

    function deleteApp(app, onCompleteFn) {
      function deleteServices(services, service, onCompletedFn) {
        if (!service || !services) {
          return onCompletedFn();
        }
        var id = service.id;
        if (!id) {
          log.warn("No ID for service " + angular.toJson(service));
        } else {
          KubernetesServices.then((KubernetesServices:ng.resource.IResourceClass) => {
            KubernetesServices.delete({
              id: id
            }, undefined, () => {
              log.debug("Deleted service: ", id);
              deleteServices(services, services.shift(), onCompletedFn);
            }, (error) => {
              log.debug("Error deleting service: ", error);
              deleteServices(services, services.shift(), onCompletedFn);
            });
          });
        }
      }

      function deleteReplicationControllers(replicationControllers, replicationController, onCompletedFn) {
        if (!replicationController || !replicationControllers) {
          return onCompletedFn();
        }
        var id = replicationController.id;
        if (!id) {
          log.warn("No ID for replicationController " + angular.toJson(replicationController));
        } else {
          KubernetesReplicationControllers.then((KubernetesReplicationControllers:ng.resource.IResourceClass) => {
            KubernetesReplicationControllers.delete({
              id: id
            }, undefined, () => {
              log.debug("Deleted replicationController: ", id);
              deleteReplicationControllers(replicationControllers, replicationControllers.shift(), onCompletedFn);
            }, (error) => {
              log.debug("Error deleting replicationController: ", error);
              deleteReplicationControllers(replicationControllers, replicationControllers.shift(), onCompletedFn);
            });
          });
        }
      }

      function deletePods(pods, pod, onCompletedFn) {
        if (!pod || !pods) {
          return onCompletedFn();
        }
        var id = pod.id;
        if (!id) {
          log.warn("No ID for pod " + angular.toJson(pod));
        } else {
          KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {
            KubernetesPods.delete({
              id: id
            }, undefined, () => {
              log.debug("Deleted pod: ", id);
              deletePods(pods, pods.shift(), onCompletedFn);
            }, (error) => {
              log.debug("Error deleting pod: ", error);
              deletePods(pods, pods.shift(), onCompletedFn);
            });
          });
        }
      }

      var services = [].concat(app.services);
      deleteServices(services, services.shift(), () => {

        var replicationControllers = [].concat(app.replicationControllers);
        deleteReplicationControllers(replicationControllers, replicationControllers.shift(), () => {

          var pods = [].concat(app.pods);
          deletePods(pods, pods.shift(), onCompleteFn);
        });
      });
    }

    $scope.deletePrompt = (selected) => {
      if (angular.isString(selected)) {
        selected = [{
          id: selected
        }];
      }
      UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
        collection: selected,
        index: '$name',
        onClose: (result:boolean) => {
          if (result) {
            function deleteSelected(selected, next) {
              if (next) {
                var id = next.name;
                log.debug("deleting: ", id);
                deleteApp(next, () => {
                  log.debug("deleted: ", id);
                  deleteSelected(selected, selected.shift());
                });
              }
            }

            deleteSelected(selected, selected.shift());
          }
        },
        title: 'Delete Apps?',
        action: 'The following Apps will be deleted:',
        okText: 'Delete',
        okClass: 'btn-danger',
        custom: "This operation is permanent once completed!",
        customClass: "alert alert-warning"
      }).open();
    };

    $scope.appSelector = {
      filterText: "",
      folders: [],
      selectedApps: [],

      isOpen: (folder) => {
        if ($scope.appSelector.filterText !== '' || folder.expanded) {
          return "opened";
        }
        return "closed";
      },

      getSelectedClass: (app) => {
        if (app.abstract) {
          return "abstract";
        }
        if (app.selected) {
          return "selected";
        }
        return "";
      },

      showApp: (app) => {
        return appMatches(app) && !appRunning(app);
      },

      showFolder: (folder) => {
        return !$scope.appSelector.filterText || folder.apps.some((app) => appMatches(app) && !appRunning(app));
      },

      clearSelected: () => {
        angular.forEach($scope.appSelector.folders, (folder) => {
          angular.forEach(folder.apps, (app) => {
            app.selected = false;
          });
        });
        $scope.appSelector.selectedApps = [];
        Core.$apply($scope);
      },

      updateSelected: () => {
        // lets update the selected apps
        var selectedApps = [];
        angular.forEach($scope.appSelector.folders, (folder) => {
          var apps = folder.apps.filter((app) => app.selected);
          if (apps) {
            selectedApps = selectedApps.concat(apps);
          }
        });
        $scope.appSelector.selectedApps = selectedApps.sortBy("name");
      },

      select: (app, flag) => {
        app.selected = flag;
        $scope.appSelector.updateSelected();
      },

      hasSelection: () => {
        return $scope.appSelector.folders.any((folder) => folder.apps.any((app) => app.selected));
      },


      runSelectedApps: () => {
        // lets run all the selected apps
        angular.forEach($scope.appSelector.selectedApps, (app) => {
          var name = app.name;
          var metadataPath = app.metadataPath;
          if (metadataPath) {
            // lets load the json/yaml
            var url = Wiki.gitRelativeURL(branch, metadataPath);
            if (url) {
              $http.get(url).
                success(function (data, status, headers, config) {
                  if (data) {
                    // lets convert the json object structure into a string
                    var json = angular.toJson(data);
                    var fn = () => {};
                    Kubernetes.runApp($location, jolokia, $scope, json, name, fn, namespace);
                  }
                }).
                error(function (data, status, headers, config) {
                  $scope.summaryHtml = null;
                  log.warn("Failed to load " + url + " " + data + " " + status);
                });
            }
          }
        });
        // lets go back to the apps view
        $scope.appSelector.clearSelected();
        $scope.appSelectorShow = false;
      }
    };

    $scope.resizeDialog = {
      dialog: new UI.Dialog(),
      onOk: () => {
        $scope.resizeDialog.dialog.close();
        resizeController($http, KubernetesApiURL, $scope.resize.controller.id, $scope.resize.newReplicas, () => {
          // lets immediately update the replica count to avoid waiting for the next poll
          $scope.resize.controller.replicas = $scope.resize.newReplicas;
          Core.$apply($scope);
        })
      },
      open: () => {
        $scope.resizeDialog.dialog.open();
      },
      close: () => {
        $scope.resizeDialog.dialog.close();
      }
    };


  }]);
}
