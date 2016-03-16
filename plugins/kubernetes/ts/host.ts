/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="kubernetesModel.ts"/>

module Kubernetes {

  export var HostController = controller("HostController",
    ["$scope", "KubernetesModel", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;
        $scope.rawModel = null;

        $scope.itemConfig = {
          properties: {}
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

        updateData();

        function updateData() {
          $scope.id = $routeParams["id"];
          $scope.item = null;
          if ($scope.id) {
            var url = UrlHelpers.join(KubernetesApiURL, "nodes", $scope.id);
            $http.get(url).
              success(function (data, status, headers, config) {
                if (data) {
                  $scope.item = data;
                }
                if ($scope.item) {
                  $scope.rawModel = toRawYaml($scope.item);
                }
              }).
            error(function (data, status, headers, config) {
              log.warn("Failed to load " + url + " " + data + " " + status);
            });
          } else {
            $scope.rawModel = null;
            Core.$apply($scope);
          }
        }
      }]);
}
