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
            var url = buildConfigRestUrl;
            $http.get(url).
              success(function (data, status, headers, config) {
                if (data) {
                  $scope.entity = data;
                }
                $scope.fetched = true;
                Core.$apply($scope);
              }).
              error(function (data, status, headers, config) {
                log.warn("Failed to load " + url + " " + data + " " + status);
              });
          } else {
            $scope.fetched = true;

            // TODO default to the right registry URL...
            var defaultRegistry = "172.30.17.189:5000";

            $scope.entity = {
              "apiVersion": "v1beta1",
              "kind": "BuildConfig",
              "metadata": {
                "name": "",
                "labels": {
                  "name": ""
                }
              },
              "parameters": {
                "output": {
                  "imageTag": "",
                  "registry": defaultRegistry
                },
                "source": {
                  "git": {
                    "uri": ""
                  },
                  "type": "Git"
                },
                "strategy": {
                  "stiStrategy": {
                    "builderImage": "fabric8/base-sti"
                  },
                  "type": "STI"
                }
              },
              "triggers": []
            };
            Core.$apply($scope);
          }
        }
      }]);
}
