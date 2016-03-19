/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var ServiceController = controller("ServiceController",
    ["$scope", "KubernetesModel", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    $scope.rawModel = null;

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    $scope.itemConfig = {
      properties: {
        '^\\/labels$': {
          template: $templateCache.get('labelTemplate.html')
        }
      }
    };

    $scope.$on('kubernetesModelUpdated', function () {
      updateData();
    });

    $scope.$watch('model.services', (newValue, oldValue) => {
      updateData();
    }, true);

    $scope.$on('$routeUpdate', ($event) => {
      updateData();
    });

    $scope.flipRaw = () => {
      $scope.rawMode = !$scope.rawMode;
      Core.$apply($scope);
    };

    updateData();

    function updateData() {
      $scope.id = $routeParams["id"];
      $scope.namespace = $routeParams["namespace"] || KubernetesState.selectedNamespace;
      $scope.item = $scope.model.getService($scope.namespace, $scope.id);
      if ($scope.item) {
        $scope.rawModel = toRawYaml($scope.item);
      }
      Core.$apply($scope);
    }
  }]);
}
