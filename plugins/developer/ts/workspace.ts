/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var WorkspaceController = controller("WorkspaceController",
    ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;
        $scope.id = $routeParams["namespace"];
        $scope.schema = KubernetesSchema;
        $scope.config = KubernetesSchema.definitions.kubernetes_Namespace;

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.breadcrumbConfig = createWorkspaceBreadcrumbs();
        $scope.subTabConfig = Developer.createWorkspaceSubNavBars();



        $scope.$on('kubernetesModelUpdated', function () {
          updateData();
        });

        function updateData() {
          var projectsOrNamespaces = Kubernetes.isOpenShift ? $scope.model.projects : $scope.model.namespaces;
          $scope.entity = Kubernetes.getNamed(projectsOrNamespaces, $scope.id) || {}
          enrichWorkspace($scope.entity);
          $scope.fetched = true;
          $scope.model.fetched = true;
        }

        updateData();
      }]);
}
