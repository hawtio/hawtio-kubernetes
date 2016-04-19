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

        $scope.devEnvironmentLink = UrlHelpers.join(HawtioCore.documentBase(), "/kubernetes/namespace", $scope.namespace, "apps");

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
              displayName: 'Environment Name',
              cellTemplate: $templateCache.get("viewNamespaceProjectsTemplate.html")
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

      }]);
}
