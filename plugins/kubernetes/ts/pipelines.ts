/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var PipelinesController = controller("PipelinesController", ["$scope", "KubernetesModel", "KubernetesBuilds", "KubernetesState", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
    ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesBuilds, KubernetesState, $dialog, $window, $templateCache, $routeParams, $location:ng.ILocationService, localStorage, $http, $timeout, KubernetesApiURL) => {

      $scope.kubernetes = KubernetesState;
      $scope.model = KubernetesModel;
      $scope.KubernetesBuilds = KubernetesBuilds;

      Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

      function reloadData() {
        var url = buildsRestURL;
        $http.get(url).
          success(function (data, status, headers, config) {
            if (data) {
              $scope.builds = data.items;
              updateData();
            }
          }).
          error(function (data, status, headers, config) {
            log.warn("Failed to load " + url + " " + data + " " + status);
          });
        url = buildConfigsRestURL;
        $http.get(url).
          success(function (data, status, headers, config) {
            if (data) {
              $scope.buildConfigs = data.items;
              updateData();
            }
          }).
          error(function (data, status, headers, config) {
            log.warn("Failed to load " + url + " " + data + " " + status);
          });
      }

      /**
       * Lets update the various data to join them together to a pipeline model
       */
      function updateData() {
        var pipelineSteps = {};
        if ($scope.buildConfigs && $scope.builds) {
          $scope.fetched = true;

          angular.forEach($scope.buildConfigs, (buildConfig) => {
            var pipelineKey = createPipelineKey(buildConfig);
            if (pipelineKey) {
              pipelineSteps[pipelineKey] = {
                buildConfig: buildConfig,
                builds: [],
                triggeredBy: null,
                triggersSteps: []
              }
            }
          });
          angular.forEach($scope.builds, (build) => {
            var pipelineKey = createPipelineKey(build);
            if (pipelineKey) {
              var pipeline = pipelineSteps[pipelineKey];
              if (!pipeline) {
                console.log("warning no pipeline generated for buildConfig for key " + pipelineKey + " for build " + angular.toJson(build, true));
              } else {
                pipeline.builds.push(build);
              }
            }
          });

          // TODO now we need to look at the triggers to figure out which pipelineSteps triggers each pipelineStep


          // now lets create an array of all piplines, starting from the first known step with a list of the steps

          var pipelines = [];
          angular.forEach(pipelineSteps, (pipelineStep, key) => {
            if (!pipelineStep.triggeredBy) {
              // we are a root step....
              pipelines.push(pipelineStep);
              // now lets add all the steps for this key...
              pipelineStep.triggersSteps.push(pipelineStep);
              angular.forEach(pipelineSteps, (step) => {
                if (step.triggeredBy === key) {
                  pipelineStep.triggersSteps.push(step);
                }
              });
            }
          });

          // TODO here's a hack to populate some dummy data
          if (!pipelines.length) {
            function createBuildConfig(name, gitUri) {
              return {
                "apiVersion": "v1beta1",
                "kind": "BuildConfig",
                "metadata": {
                  "name": name,
                  "labels": {
                    "name": name
                  }
                },
                "parameters": {
                  "output": {
                    "imageTag": "fabric8/example-camel-cdi:test",
                    "registry": "172.30.17.189:5000"
                  },
                  "source": {
                    "git": {
                      "uri": gitUri
                    },
                    "type": "Git"
                  },
                  "strategy": {
                    "stiStrategy": {
                      "builderImage": "fabric8/base-sti"
                    },
                    "type": "STI"
                  }
                }
              }
            }

            function createBuilds(buildConfig) {
              var answer = [];
              for (var i = 1; i < 4; i++) {
                var build = angular.copy(buildConfig);
                build.kind = "Build";
                build.metadata.name = "build-" + (build.metadata.name || "") + "-" + i;
                answer.push(build);
              }
            }

            var buildConfig1 = createBuildConfig("example-camel-cdi-build", "git@github.com:fabric8io/example-camel-cdi.git");
            var buildConfig2 = createBuildConfig("integration-test", "git@github.com:fabric8io/test-env.git");
            var buildConfig3 = createBuildConfig("rolling-upgrade", "git@github.com:fabric8io/prod-env.git");

            var step2 = {
              buildConfig: buildConfig2,
              builds: createBuilds(buildConfig2),
              triggeredBy: null,
              triggersSteps: []
            }
            var step3 = {
              buildConfig: buildConfig3,
              builds: createBuilds(buildConfig2),
              triggeredBy: null,
              triggersSteps: []
            }
            var step1 = {
              buildConfig: buildConfig1,
              builds: createBuilds(buildConfig1),
              triggeredBy: null,
              triggersSteps: []
            };
            step1.triggersSteps = [step1, step2, step3];
            pipelines = [step1];
          }
          $scope.pipelines = pipelines;
        }
      }

      /**
       * Lets create a unique key for build / config we can use to do linking of builds / configs / triggers
       */
      function createPipelineKey(buildConfig) {
        return Core.pathGet(buildConfig, ["parameters", "source", "git", "uri"]);
      }

      reloadData();
    }]);
}
