/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var ReplicationControllerController = controller("ReplicationControllerController",
    ["$scope", "KubernetesModel", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    $scope.rawMode = false;
    $scope.dirty = false;
    $scope.readOnly = true;
    $scope.rawModel = null

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    $scope.$on('hawtioEditor_default_dirty', ($event, dirty) => {
      $scope.dirty = dirty;
    });

    $scope.save = () => {
      var obj:any = null;
      try {
        obj = angular.fromJson($scope.rawModel);
      } catch (err) {
        Core.notification("warning", "Failed to save replication controller, error: \"" + err + "\"");
      }
      if (!obj) {
        return;
      }
      $scope.readOnly = true;
      KubernetesAPI.put({
        object: obj,
        success: (data) => {
          $scope.dirty = false;
          Core.notification("success", "Saved replication controller " + getName(obj));
        },
        error: (err) => {
          console.log("Got error: ", err);
          Core.notification("warning", "Failed to save replication controller, error: \"" + err.message + "\"");
          $scope.dirty = false;
          updateData();
        }
      });
    };

    $scope.itemConfig = {
      properties: {
        '^\\/labels$': {
          template: $templateCache.get('labelTemplate.html')
        }
      }
    };

    $scope.$on('kubernetesModelUpdated', () => {
      updateData();
    });

    $scope.$on('$routeUpdate', ($event) => {
      updateData();
    });

    $scope.$watch('model.pods', (newValue, oldValue) => {
      updateData();
    }, true);

    $scope.flipRaw = () => {
      $scope.rawMode = !$scope.rawMode;
      Core.$apply($scope);
    };

    updateData();

    function updateData() {
      if ($scope.dirty) {
        return;
      }
      $scope.id = $routeParams["id"];
      $scope.item = $scope.model.getReplicationController(KubernetesState.selectedNamespace, $scope.id);
      if ($scope.item) {
        $scope.rawModel = toRawJson($scope.item);
      }
      Core.$apply($scope);
    }
  }]);
}
