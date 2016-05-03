/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var ProjectEnvironmentsController = controller("ProjectEnvironmentsController",
    ["$scope", "KubernetesModel", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "$element",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, $element) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;

        ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.breadcrumbConfig = createProjectBreadcrumbs();
        $scope.subTabConfig = Developer.createWorkspaceSubNavBars();

        $scope.tableConfig = {
          data: 'model.environments',
          showSelectionCheckbox: true,
          enableRowClickSelection: false,
          multiSelect: true,
          selectedItems: [],
          filterOptions: {
            filterText: $location.search()["q"] || ''
          },
          columnDefs: [
            {
              field: 'order',
              displayName: 'Order'
            },
            {
              field: 'name',
              displayName: 'Environment',
              cellTemplate: $templateCache.get("environmentNameTemplate.html")
            },
            {
              field: 'key',
              displayName: 'Actions',
              cellTemplate: $templateCache.get("environmentEditTemplate.html")
            },
            {
              field: 'namespace',
              displayName: 'Namespace'
            },
            {
              field: 'clusterUrl',
              displayName: 'Cluster URL'
            }
          ]
        };

        var kubeClient = Kubernetes.createKubernetesClient("configmaps");

        $scope.editEntityLink = (entity) => {
          if (entity) {
            var key = entity.key;
            if (key) {
              return UrlHelpers.join(HawtioCore.documentBase(), '/workspaces', $scope.namespace, "/environments/edit", key);
            }
            return "";
          }
        };

        $scope.editEntity = () => {
          var selectedItems = $scope.tableConfig.selectedItems || [];
          if (selectedItems.length) {
            var entity = selectedItems[0] || {};
            var key = entity.key;
            if (key) {
              $location.path(UrlHelpers.join('/workspaces', $scope.namespace, "/environments/edit", key));
            } else {
              log.warn("No key for environment " + angular.toJson(entity));
            }
          }
        };

        $scope.deletePrompt = (selected) => {
          UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
            collection: selected,
            index: 'label',
            onClose: (result:boolean) => {
              if (result) {
                function deleteSelected(selected, next) {
                  if (next) {
                    deleteEntity(next, () => {
                      deleteSelected(selected, selected.shift());
                    });
                  }
                }
                deleteSelected(selected, selected.shift());
              }
            },
            title: 'Delete Environments',
            action: 'The following Environments will be deleted:',
            okText: 'Delete',
            okClass: 'btn-danger',
            custom: "This operation is permanent once completed!",
            customClass: "alert alert-warning"
          }).open();
        };

        function deleteEntity(entity, callback) {
          var key = (entity || {}).key;
          if (key) {
            var configMap = Kubernetes.getNamed($scope.model.configmaps, Kubernetes.environemntsConfigMapName);
            if (configMap) {
              delete configMap.data[key];
              kubeClient.put(configMap, (data) => {
                log.info("Deleted environment " + key);
                if (angular.isFunction(callback)) {
                  callback();
                }
              });
            }
          }
        }

        $scope.moveEntity = (entity, up, callback = null) => {
          var environments = _.sortBy($scope.model.environments, (element) => element['order']);
          var index = _.indexOf(environments, entity);
          log.info("Moving entity " + entity['key'] + " at index " + index + " up: " + up);

          var nextIndex = up ? index - 1 : index + 1;

          function getKey(idx) {
            if (idx >= 0 || idx < environments.length) {
              var env = environments[idx];
              return (env || {})['key']
            } else {
              return null;
            }
          }

          var key1 = getKey(index);
          var key2 = getKey(nextIndex);
          if (key1 && key2) {
            var configMap = Kubernetes.getNamed($scope.model.configmaps, Kubernetes.environemntsConfigMapName);
            if (configMap) {
              var configMapData = configMap.data;

              var data1 = jsyaml.load(configMapData[key1]);
              var data2 = jsyaml.load(configMapData[key2]);
              var tmp = data1.order || 0;
              data1.order = data2.order || 0;
              data2.order = tmp;

              var yaml1 = jsyaml.safeDump(data1);
              var yaml2 = jsyaml.safeDump(data2);
              configMapData[key1] = yaml1;
              configMapData[key2] = yaml2;

              kubeClient.put(configMap, (data) => {
                log.info("Switched order of " + key1 + " and " + key2);
                log.info("Environments are now: " + angular.toJson(configMapData));
                if (angular.isFunction(callback)) {
                  callback();
                }
              });
            }
          } else {
            log.warn("Could not find keys for index " + index + " and " + nextIndex + ". Found " + key1 + " and " + key2);
          }
        };

      }]);
}
