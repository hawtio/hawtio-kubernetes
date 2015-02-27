/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var ServiceEditController = controller("ServiceEditController",
    ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    $scope.id = $routeParams["id"];
    $scope.schema = KubernetesSchema;
    $scope.config = KubernetesSchema.definitions.kubernetes_v1beta2_Service;

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    $scope.$on('$routeUpdate', ($event) => {
      updateData();
    });

    updateData();

    function updateData() {
      if ($scope.id) {
        $scope.entity = $scope.model.getService(KubernetesState.selectedNamespace, $scope.id);
        Core.$apply($scope);
        $scope.fetched = true;
      } else {
        $scope.fetched = true;
      }
    }
  }]);
}
