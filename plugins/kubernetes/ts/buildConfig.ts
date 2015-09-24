/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var BuildConfigController = controller("BuildConfigController",
    ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;
        $scope.id = $routeParams["id"];
        $scope.schema = KubernetesSchema;
        $scope.config = KubernetesSchema.definitions.os_build_BuildConfig;

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.id, [{
          label: "Detail",
          title: "View the project detail"
        }]);
        $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id);

        $scope.$on('kubernetesModelUpdated', function () {
          updateData();
        });

        $scope.$on('$routeUpdate', ($event) => {
          updateData();
        });

        updateData();

        function updateData() {
          $scope.item = null;
          if ($scope.id) {
            var url = buildConfigRestUrl($scope.id);
            $http.get(url).
              success(function (data, status, headers, config) {
                if (data) {
                  $scope.entity = data;
                  var sortedBuilds = null;
                  enrichBuildConfig(data, sortedBuilds);
                }
                $scope.fetched = true;
                Core.$apply($scope);
              }).
              error(function (data, status, headers, config) {
                log.warn("Failed to load " + url + " " + data + " " + status);
              });
          } else {
            $scope.fetched = true;
            Core.$apply($scope);
          }
        }
      }]);
}
