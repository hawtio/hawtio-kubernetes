/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var BuildLogsController = controller("BuildLogsController",
    ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;
        $scope.id = $routeParams["id"];
        $scope.schema = KubernetesSchema;
        $scope.config = KubernetesSchema.definitions.os_build_Build;

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

        $scope.$on('kubernetesModelUpdated', function () {
          updateData();
        });

        $scope.$on('$routeUpdate', ($event) => {
          updateData();
        });

        $scope.logsText = "Loading logs...";

        updateData();

        function updateData() {
          $scope.item = null;
          if ($scope.id) {
            var url = buildRestUrl($scope.id);
            $http.get(url).
              success(function (data, status, headers, config) {
                if (data) {
                  $scope.entity = enrichBuild(data);
                }
                $scope.fetched = true;
                Core.$apply($scope);
              }).
              error(function (data, status, headers, config) {
                log.warn("Failed to load " + url + " " + data + " " + status);
              });

            url = buildLogsRestUrl($scope.id);
            $http.get(url).
              success(function (data, status) {
                $scope.logsText = data;
                Core.$apply($scope);
              }).
              error(function (data, status) {
                $scope.logsText = "Failed to load logs from: " + url + " " + data + " status: " + status;
                Core.$apply($scope);
              }).
              catch(function (error) {
                $scope.logsText = "Failed to load logs: " + angular.toJson(error, true);
                Core.$apply($scope);
              });
          } else {
            $scope.fetched = true;
            Core.$apply($scope);
          }
        }
      }]);
}
