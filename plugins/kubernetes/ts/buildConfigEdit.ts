/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var BuildConfigEditController = _module.controller("Kubernetes.BuildConfigEditController", ($scope, $element, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema, $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, K8SClientFactory, SchemaRegistry:HawtioForms.SchemaRegistry) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;
        $scope.id = $routeParams["id"];
        $scope.schema = KubernetesSchema;
        var specConfig = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.BuildConfigSpec');
        var gitBuildSource = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.GitBuildSource');
        var buildSource = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.BuildSource');
        var buildOutput = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.BuildOutput');
        var resources = SchemaRegistry.getSchema('io.fabric8.kubernetes.api.model.ResourceRequirements');
        var revision = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.SourceRevision');
        var strategy = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.BuildStrategy');

        // $scope.config = KubernetesSchema.definitions.os_build_BuildConfig;
        //$scope.specConfig = KubernetesSchema.definitions.os_build_BuildConfigSpec;
        //
        specConfig.properties['triggers']['label-attributes'] = {
          style: 'display: none;'
        };

        gitBuildSource.controls = ['uri', 'ref', '*'];
        buildSource.properties['type'].type = 'hidden';
        buildSource.properties['type']['default'] = 'Git';
        buildSource.controls = ['git', 'contextDir', 'sourceSecret', '*'];

        gitBuildSource['hideLegend'] = true;
        buildSource['hideLegend'] = true;
        buildOutput['hideLegend'] = true;
        resources['hideLegend'] = true;
        revision['hideLegend'] = true;
        strategy['hideLegend'] = true;

        strategy.controls = ['type', '*'];
        strategy.properties['type'] = {
          type: 'string',
          enum: ['Custom', 'Docker', 'Source']
        };
        // TODO this requires some support in hawtio-forms
        strategy.properties['customStrategy']['control-group-attributes'] = {
          'ng-show': "entity.strategy.type == 'Custom'"
        };
        strategy.properties['dockerStrategy']['control-group-attributes'] = {
          'ng-show': "entity.strategy.type == 'Docker'"
        };
        strategy.properties['sourceStrategy']['control-group-attributes'] = {
          'ng-show': "entity.strategy.type == 'Source'"
        };

        // re-arranging the controls
        //specConfig.controls = ['source', '*'];
        
        // tabs
        specConfig.tabs = {
          "Source": ["source"],
          "Revision": ["revision"],
          "Output": ["output"],
          "Resources": ["resources"],
          "Strategy": ["strategy"],
          "Triggers": ["triggers"],
          "Service Account": ["serviceAccount"]
        };
        /*
         * wizard, needs an 'onFinish' function in the scope
        specConfig.wizard = <any>{
          pages: {
            Source: {
              controls: ["source"]
            },
            Revision: {
              controls: ["revision"]
            },
            Output: {
              controls: ["output"]
            },
            Resources: {
              controls: ["resources"]
            },
            Strategy: {
              controls: ["strategy"]
            },
            Triggers: {
              controls: ["triggers"]
            },
            "Service Account": {
              controls: ["serviceAccount"]
            }
          }
        };
        */

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

        $scope.specConfig = specConfig;

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
      });
}
