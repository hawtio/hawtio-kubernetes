/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var PodController = controller("ConfigMapController",
    ["$scope", "KubernetesModel", "KubernetesState", "ServiceRegistry", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "$window", "KubernetesApiURL",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesState, ServiceRegistry,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, $window, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    $scope.rawModel = null;

    $scope.itemConfig = {
      properties: {
        'containers/image$': {
          template: $templateCache.get('imageTemplate.html')
        },
        'status/phase': {
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

    $scope.$watch('model.configmaps', (newValue, oldValue) => {
      updateData();
    }, true);

    $scope.flipRaw = () => {
      $scope.rawMode = !$scope.rawMode;
      Core.$apply($scope);
    };

    updateData();

    function updateData() {
      $scope.id = $routeParams["id"];
      $scope.item = _.find($scope.model.configmaps, (configmap) => $scope.id === KubernetesAPI.getName(configmap));
      if ($scope.item) {
        $scope.rawModel = toRawYaml($scope.item);
      }
      Core.$apply($scope);
    }
  }]);
}
