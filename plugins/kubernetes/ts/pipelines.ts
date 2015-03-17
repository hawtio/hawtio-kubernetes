/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var PipelinesController = controller("PipelinesController", ["$scope", "KubernetesModel", "KubernetesBuilds", "KubernetesState", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
    ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesBuilds, KubernetesState, $dialog, $window, $templateCache, $routeParams, $location:ng.ILocationService, localStorage, $http, $timeout, KubernetesApiURL) => {

      $scope.kubernetes = KubernetesState;
      $scope.model = KubernetesModel;
      $scope.KubernetesBuilds = KubernetesBuilds;

      Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

      /**
       * Lets update the various data to join them together to a pipeline model
       */
      function updateData() {
        var pipelineSteps = {};
        if ($scope.buildConfigs && $scope.builds && $scope.deploymentConfigs) {
          enrichBuildConfigs($scope.buildConfigs, $scope.builds);
          $scope.fetched = true;

          angular.forEach($scope.buildConfigs, (buildConfig) => {
            var pipelineKey = createPipelineKey(buildConfig);
            if (pipelineKey) {
              pipelineSteps[pipelineKey] = {
                buildConfig: buildConfig,
                builds: [],
                triggeredBy: null,
                triggersSteps: [],
                $class: 'pipeline-build'
              }
            }
          });
          angular.forEach($scope.builds, (build) => {
            var pipelineKey = createPipelineKey(build);
            if (pipelineKey) {
              var pipeline = pipelineSteps[pipelineKey];
              if (!pipeline) {
                //console.log("warning no pipeline generated for buildConfig for key " + pipelineKey + " for build " + angular.toJson(build, true));
                console.log("warning no pipeline generated for buildConfig for key " + pipelineKey + " for build " + build.$name);
              } else {
                pipeline.builds.push(build);
              }
            }
          });

          // TODO now we need to look at the triggers to figure out which pipelineSteps triggers each pipelineStep


          // now lets create an array of all pipelines, starting from the first known step with a list of the steps

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

          angular.forEach($scope.deploymentConfigs, (deploymentConfig) => {
            if (!deploymentConfig.kind) {
              deploymentConfig.kind = "DeploymentConfig";
            }
            angular.forEach(deploymentConfig.triggers, (trigger) => {
              var type = trigger.type;
              var imageChangeParams = trigger.imageChangeParams;
              if (imageChangeParams && type === "ImageChange") {
                var from = imageChangeParams.from;
                if (from) {
                  var name = from.name;
                  if (from.kind === "ImageRepository") {
                    var tag = imageChangeParams.tag || "latest";
                    if (name) {
                      // now lets find a pipeline step which fires from this
                      angular.forEach(pipelineSteps, (pipelineStep, key) => {
                        var to = Core.pathGet(pipelineStep, ["buildConfig", "parameters", "output", "to"]);
                        if (to && to.kind === "ImageRepository") {
                          var toName = to.name;
                          if (toName === name) {
                            var selector = Core.pathGet(deploymentConfig, ["template", "controllerTemplate", "replicaSelector"]);
                            var pods = [];
                            var $podCounters = selector ? createPodCounters(selector, KubernetesModel.podsForNamespace(), pods) : null;
                            var deployPipelineStep = {
                              buildConfig: deploymentConfig,
                              $class: 'pipeline-deploy',
                              $podCounters: $podCounters,
                              $pods: pods
                            };
                            pipelineStep.triggersSteps.push(deployPipelineStep);
                          }
                        }
                      });
                    }
                  }
                }
              }
            });
          });
          $scope.pipelines = pipelines;
        }
      }

      /**
       * Lets create a unique key for build / config we can use to do linking of builds / configs / triggers
       */
      function createPipelineKey(buildConfig) {
        return Core.pathGet(buildConfig, ["parameters", "source", "git", "uri"]);
      }

      $scope.$keepPolling = () => keepPollingModel;
      $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
        var ready = 0;
        var numServices = 3;

        function maybeNext() {
          if (++ready >= numServices) {
            next();
          }
        }

        var url = buildsRestURL;
        $http.get(url).
          success(function (data, status, headers, config) {
            if (data) {
              $scope.builds = enrichBuilds(data.items);
              updateData();
            }
            maybeNext();
          }).
          error(function (data, status, headers, config) {
            log.warn("Failed to load " + url + " " + data + " " + status);
            maybeNext();

          });
        url = buildConfigsRestURL;
        $http.get(url).
          success(function (data, status, headers, config) {
            if (data) {
              $scope.buildConfigs = data.items;
              updateData();
            }
            maybeNext();
          }).
          error(function (data, status, headers, config) {
            log.warn("Failed to load " + url + " " + data + " " + status);
            maybeNext();
          });
        url = deploymentConfigsRestURL;
        $http.get(url).
          success(function (data, status, headers, config) {
            if (data) {
              $scope.deploymentConfigs = data.items;
              updateData();
            }
            maybeNext();
          }).
          error(function (data, status, headers, config) {
            log.warn("Failed to load " + url + " " + data + " " + status);
            maybeNext();
          });
      });

      $scope.fetch();
    }]);

}
