/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var PodController = controller("PodController",
    ["$scope", "KubernetesModel", "KubernetesState", "ServiceRegistry", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "$window", "KubernetesApiURL",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesState, ServiceRegistry,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, $window, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    $scope.rawMode = false;
    $scope.rawModel = null;

    $scope.itemConfig = {
      properties: {
        'manifest/containers/image$': {
          template: $templateCache.get('imageTemplate.html')
        },
        'currentState/status': {
          template: $templateCache.get('statusTemplate.html')
        },
        '\\/Env\\/': {
          template: $templateCache.get('envItemTemplate.html')
        },
        '^\\/labels$': {
          template: $templateCache.get('labelTemplate.html')
        },
        '\\/env\\/key$': {
          hidden: true
        }
      }
    };

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    $scope.$on('kubernetesModelUpdated', function () {
      updateData();
    });

    $scope.$on('$routeUpdate', ($event) => {
      updateData();
    });

    $scope.flipRaw = () => {
      $scope.rawMode = !$scope.rawMode;
      Core.$apply($scope);
    };

    $scope.openLogs = () => {
      var pods = [$scope.item];
      openLogsForPods(ServiceRegistry, $window, KubernetesModel.currentNamespace(), pods);
    };

    updateData();

    function updateData() {
      $scope.id = $routeParams["id"];
      $scope.item = $scope.model.getPod(KubernetesState.selectedNamespace, $scope.id);
      if ($scope.item) {
        $scope.rawModel = JSON.stringify($scope.item, null, 2); // spacing level = 2
      }
      Core.$apply($scope);
    }
  }]);
}
