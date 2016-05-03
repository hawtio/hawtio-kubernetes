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
          enableRowClickSelection: true,
          multiSelect: true,
          selectedItems: [],
          filterOptions: {
            filterText: $location.search()["q"] || ''
          },
          columnDefs: [
            {
              field: 'name',
              displayName: 'Environment',
              cellTemplate: $templateCache.get("environmentNameTemplate.html")
            },
            {
              field: 'name',
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
      }]);
}
