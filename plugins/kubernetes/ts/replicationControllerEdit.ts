/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var ReplicationControllerEditController = controller("ReplicationControllerEditController",
    ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "SchemaRegistry",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, schemas:HawtioForms.SchemaRegistry) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    $scope.id = $routeParams["id"];
    $scope.schema = KubernetesSchema;
    log.debug("Schema: ", $scope.schema);
    $scope.config = schemas.cloneSchema("io.fabric8.kubernetes.api.model.ReplicationController");
    //$$scope.config = KubernetesSchema.definitions.kubernetes_v1beta3_ReplicationController;

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    $scope.$on('$routeUpdate', ($event) => {
      updateData();
    });

    updateData();

    function updateData() {
      if ($scope.id) {
        $scope.entity = $scope.model.getReplicationController(KubernetesState.selectedNamespace, $scope.id);
        Core.$apply($scope);
        $scope.fetched = true;
      } else {
        $scope.fetched = true;
      }
    }
  }]);
}
