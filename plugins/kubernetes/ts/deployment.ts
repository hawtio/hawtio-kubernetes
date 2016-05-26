/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var DeploymentController = controller("DeploymentController",
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

    $scope.$watch('model.allDeployments', (newValue, oldValue) => {
      updateData();
    }, true);

    $scope.$on('kubernetesObjectSaved', ($event, obj) => {
      log.debug("Object saved: ", obj);
      var path = $location.path();
      path = path.replace('/newConfigMap', '/' + obj.metadata.name);
      $location.path(path);
      Core.$apply($scope);
    });

    $scope.flipRaw = () => {
      $scope.rawMode = !$scope.rawMode;
      Core.$apply($scope);
    };

    $scope.onSave = (obj) => {
      console.log("Saved object: ", obj);
    }

    updateData();

    function updateData() {
      $scope.id = $routeParams["id"];
      $scope.item = _.find($scope.model.allDeployments, (obj) => $scope.id === KubernetesAPI.getName(obj));
      if ($scope.item) {
        $scope.rawModel = toRawYaml($scope.item);
      }
      Core.$apply($scope);
    }
  }]);
}
