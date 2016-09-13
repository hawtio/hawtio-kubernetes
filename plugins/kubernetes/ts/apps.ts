/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {
  
  export var Apps = controller("Apps",
    ["$scope", "KubernetesModel", "KubernetesServices", "KubernetesReplicationControllers", "KubernetesPods", "KubernetesState", "KubernetesApiURL", "$templateCache", "$location", "$routeParams", "$http", "$dialog", "$timeout", 
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesServices:ng.resource.IResourceClass<any>, KubernetesReplicationControllers:ng.resource.IResourceClass<any>, KubernetesPods:ng.resource.IResourceClass<any>, KubernetesState, KubernetesApiURL,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $dialog, $timeout) => {

    $scope.model = KubernetesModel;

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
        { field: '$name', displayName: 'App', cellTemplate: $templateCache.get(UrlHelpers.join(templatePath, "appIconTemlate.html")) },
        { field: '$servicesText', displayName: 'Services', cellTemplate: $templateCache.get(UrlHelpers.join(templatePath, "appServicesTemplate.html")) },
        { field: '$replicationControllersText', displayName: 'Controllers', cellTemplate: $templateCache.get(UrlHelpers.join(templatePath, "appReplicationControllerTemplate.html")) },
        { field: '$podCount', displayName: 'Pods', cellTemplate: $templateCache.get(UrlHelpers.join(templatePath, "appPodCountsAndLinkTemplate.html")) },
        { field: '$creationDate', displayName: 'Deployed', cellTemplate: $templateCache.get(UrlHelpers.join(templatePath, "appDeployedTemplate.html")) }
      ]
    };

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);


    $scope.expandedPods = [];

    $scope.$on('do-resize', ($event, controller) => {
      $scope.resizeDialog.open(controller);
    });

        
    $scope.podExpanded = (pod) => {
      var id = getName(pod)
      return id && ($scope.expandedPods || []).indexOf(id) >= 0;
    };

    $scope.expandPod = (pod) => {
      var id = getName(pod);
      if (id) {
        $scope.expandedPods.push(id);
      }
    };

    $scope.collapsePod = (pod) => {
      var id = getName(pod);
      if (id) {
        _.remove($scope.expandedPods, (v) => id === v);
      }
    };

    $scope.$on('$routeUpdate', ($event) => {
      Kubernetes.setJson($scope, $location.search()['_id'], $scope.model.apps);
    });

    function deleteApp(app, onCompleteFn) {
      var name = app.$info.name;
      // TODO be good if we had a consistent label to use across all object types, for now we'll look for 'app' and 'project' labels
      var objects = KubernetesModel.objectsWithLabels({ 'app': name });
      objects = objects.concat(KubernetesModel.objectsWithLabels({ 'project': name }));
      objects = _.uniq(objects);
      if (!objects.length) {
        Core.notification("warning", "No objects found for app named " + name);
        if (onCompleteFn) {
          onCompleteFn();
        }
        return;
      }
      // Deployments should be deleted first, then replica-y stuff
      objects = _.sortBy(objects, (obj) => {
        switch (obj.kind) {
          case 'Deployment':
          case 'DeploymentConfig':
            return 0;
          case 'ReplicaSet':
          case 'ReplicationController':
            return 1;
          default:
            return 2;
        }
      });
      function deleteObject(object, objects) {
        function next() {
          var object = objects.shift();

          deleteObject(object, objects);
        }
        if (!object && objects.length) {
          log.debug("Invalid object, skipping");
          next();
          return;
        } if (object && !objects.length) {
          // it's just the last element, continue 
        } if (object) {
          // continue
        } else {
          // all done
          Core.notification("success", "Deleted app " + name);
          if (onCompleteFn) {
            onCompleteFn();
          }
          return;
        }
        function doDelete() {
          KubernetesAPI.del({
            object: object,
            success: (data) => {
              log.info("Deleted object: ", object);
              next();
            }, error: (err) => {
              log.warn("Failed to delete object: ", object, " due to error: ", err);
              next();
            }
          });
        }
        switch (object.kind) {
          case 'Deployment':
          case 'DeploymentConfig':
          case 'ReplicaSet':
          case 'ReplicationController':
            resizeController($http, KubernetesApiURL, object, 0, () => {
              // give a little time for the api server to deal with resize
              setTimeout(() => {
                doDelete();
              }, 500);
            });
            break;
          default:
            doDelete();
        }
      }
      deleteObject(objects.shift(), objects);
    }

    $scope.deleteSingleApp = (app) => {
      $scope.deletePrompt([app]);
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
        angular.forEach($scope.model.appFolders, (folder) => {
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
        angular.forEach($scope.model.appFolders, (folder) => {
          var apps = folder.apps.filter((app) => app.selected);
          if (apps) {
            selectedApps = selectedApps.concat(apps);
          }
        });
        $scope.appSelector.selectedApps = _.sortBy(selectedApps, "name");
      },

      select: (app, flag) => {
        app.selected = flag;
        $scope.appSelector.updateSelected();
      },

      hasSelection: () => {
        return $scope.model.appFolders.any((folder) => folder.apps.any((app) => app.selected));
      },


      runSelectedApps: () => {
        // lets run all the selected apps
        angular.forEach($scope.appSelector.selectedApps, (app) => {
          var name = app.name;
          var metadataPath = app.metadataPath;
          if (metadataPath) {
            // lets load the json/yaml
            //var url = gitPathToUrl(Wiki.gitRelativeURL(branch, metadataPath));
            var url = gitPathToUrl(metadataPath, branch);
            if (url) {
              $http.get(url).
                success(function (data, status, headers, config) {
                  if (data) {
                    // lets convert the json object structure into a string
                    var json = angular.toJson(data);
                    var fn = () => {};
                    Kubernetes.runApp($location, $scope, $http, KubernetesApiURL, json, name, fn, namespace);
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

  }]);
}
