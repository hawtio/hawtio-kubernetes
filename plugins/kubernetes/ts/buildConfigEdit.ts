/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var BuildConfigEditController = controller("BuildConfigEditController",
    ["$scope", "$element", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "K8SClientFactory",
      ($scope, $element, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, K8SClientFactory) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;
        $scope.id = $routeParams["id"];
        $scope.schema = KubernetesSchema;
        $scope.config = KubernetesSchema.definitions.os_build_BuildConfig;
        $scope.specConfig = KubernetesSchema.definitions.os_build_BuildConfigSpec;

        $scope.specConfig.controls = ['source', '*'];

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

        $scope.buildConfigClient = K8SClientFactory.create("buildconfigs", $scope.namespace);

        $element.on('$destroy', () => {
          $scope.$destroy();
        });
        $scope.$on('$destroy', () => {
          K8SClientFactory.destroy($scope.buildConfigClient);
        });

/*
        $scope.$on('kubernetesModelUpdated', function () {
          updateData();
        });

*/
        $scope.$on('$routeUpdate', ($event) => {
          updateData();
        });

        $scope.save = () => {
          log.info("Saving!");


          var entity = $scope.entity;
          var spec = (entity || {}).spec || {};

          // TODO update the jenkins job name!

          // lets delete lots of cruft
          var strategy = spec.strategy || {};
          delete strategy["dockerStrategy"];
          delete strategy["sourceStrategy"];

          delete spec["revision"];
          delete spec["output"];
          delete spec["resources"];

          log.info(angular.toJson(entity, true));

          $scope.buildConfigClient.put(entity, (obj) => {
            log.info("build config created!");
          })
        };

        updateData();


        var jenkinsUrl = Developer.jenkinsLink();
        var jobName = "";

        function updateData() {
          $scope.item = null;
          if ($scope.id) {
            var url = buildConfigRestUrl;
            $http.get(url).
              success(function (data, status, headers, config) {
                if (data) {
                  $scope.entity = data;
                }
                $scope.spec = ($scope.entity || {}).spec || {};
                $scope.fetched = true;
                Core.$apply($scope);
              }).
              error(function (data, status, headers, config) {
                log.warn("Failed to load " + url + " " + data + " " + status);
              });
          } else {
            $scope.fetched = true;

            $scope.entity = {
              "apiVersion": "v1",
              "kind": "BuildConfig",
              "metadata": {
                "name": "",
                "labels": {
                }
              },
              "spec": {
                "source": {
                  "type": "Git"
                },
                "strategy": {
                    "type": "Custom",
                    "customStrategy": {
                        "from": {
                            "kind": "DockerImage",
                            "name": "fabric8/openshift-s2i-jenkins-trigger"
                        },
                        "env": [
                            {
                                "name": "BASE_URI",
                                "value": jenkinsUrl
                            },
                            {
                                "name": "JOB_NAME",
                                "value": jobName
                            }
                        ]
                    }
                }
              }
            };
            $scope.spec = $scope.entity.spec;
            Core.$apply($scope);
          }
        }
      }]);
}
