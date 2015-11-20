/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var BuildConfigEditController = _module.controller("Kubernetes.BuildConfigEditController", ($scope, $element, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema, $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, K8SClientFactory, SchemaRegistry:HawtioForms.SchemaRegistry) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;
        $scope.id = $routeParams["project"] || $routeParams["id"];
        $scope.schema = KubernetesSchema;


        var specConfig = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.BuildConfigSpec');
        var gitBuildSource = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.GitBuildSource');
        var buildSource = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.BuildSource');
        var buildOutput = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.BuildOutput');
        var resources = SchemaRegistry.getSchema('io.fabric8.kubernetes.api.model.ResourceRequirements');
        var revision = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.SourceRevision');
        var strategy = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.BuildStrategy');
        var customStrategy = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.CustomBuildStrategy');
        var buildTriggerPolicy = SchemaRegistry.getSchema('io.fabric8.openshift.api.model.BuildTriggerPolicy');

        var getSecrets = () => {
          return $scope.secrets;
        };


        var secretSchemaType = "fabric8_SecretReference";
        var secretSchemaRef = "#/definitions/" + secretSchemaType;
        var secretSchemaJavaType = "io.fabric8.console.SecretReference";

        var secretNameElement: HawtioForms.FormElement = {
          "type": "string",
          "enum": getSecrets,
          required: true
        };

        var secretSchema: HawtioForms.FormConfiguration = <any> {
          "type": "object",
          properties: {
            "name": secretNameElement
          },
          javaType: secretSchemaJavaType
        };
        SchemaRegistry.addSchema(secretSchemaType, secretSchema);

        // lets switch to the new secrets types:
        var sourceSecretProperty = Core.pathGet(buildSource, ["properties", "sourceSecret"]);
        angular.forEach([
          Core.pathGet(customStrategy, ["properties", "pullSecret"]),
          sourceSecretProperty,
        ], (schemaType) => {
          if (schemaType) {
            schemaType["type"] = secretSchemaType;
            schemaType["$ref"] = secretSchemaRef;
            schemaType["javaType"] = secretSchemaJavaType;
          }
        });

        // lets try make the buildSource's sourceSecret mandatory
        //schemaSetRequired(customStrategy, 'pullSecret');
        schemaSetRequired(buildSource, 'sourceSecret');
        if (sourceSecretProperty) {
          Core.pathSet(sourceSecretProperty, ['properties', 'required'], true);
          Core.pathSet(sourceSecretProperty, ['properties', 'input-attributes', 'required'], true);
        }


        $scope.customStrategy = customStrategy;
        $scope.buildSource = buildSource;

        $scope.secrets = [];

        // $scope.config = KubernetesSchema.definitions.os_build_BuildConfig;
        //$scope.specConfig = KubernetesSchema.definitions.os_build_BuildConfigSpec;
        //
        specConfig.style = HawtioForms.FormStyle.STANDARD;
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
          type: 'text',
          enum: [{
            'value': 'Custom',
            'label': 'Custom'
          }, {
            'value': 'Docker',
            'label': 'Docker'
          }, {
            'value': 'Source',
            'label': 'Source'
          }]
        };
        customStrategy['control-group-attributes'] = {
          'ng-show': "entity.type == 'Custom'"
        };
        strategy.properties['dockerStrategy']['control-group-attributes'] = {
          'ng-show': "entity.type == 'Docker'"
        };
        strategy.properties['sourceStrategy']['control-group-attributes'] = {
          'ng-show': "entity.type == 'Source'"
        };

        buildTriggerPolicy.controls = ['type', '*'];
        buildTriggerPolicy.properties['type'] = {
          type: 'string',
          enum: [{
            'value': 'Github',
            'label': 'Github'
          }, {
            'value': 'ImageChange',
            'label': 'Image Change'
          }, {
            'value': 'Generic',
            'label': 'Generic'
          }]
        };
        buildTriggerPolicy.properties['generic']['control-group-attributes'] = {
          'ng-show': "entity.type == 'Generic'"
        };
        buildTriggerPolicy.properties['github']['control-group-attributes'] = {
          'ng-show': "entity.type == 'Github'"
        };
        buildTriggerPolicy.properties['imageChange']['control-group-attributes'] = {
          'ng-show': "entity.type == 'ImageChange'"
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
        $scope.breadcrumbConfig = Developer.createProjectSettingsBreadcrumbs($scope.projectId);
        $scope.subTabConfig = Developer.createProjectSettingsSubNavBars($scope.projectId);

        watch($scope, $element, "secrets", $scope.namespace, onSecrets);


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

          var strategyPullSecretName = Core.pathGet(spec, ["strategy", "customStrategy", "pullSecret", "name"]);
          var sourceSecretName = Core.pathGet(spec, ["source", "sourceSecret", "name"]);
          log.info("sourceSecretName: " + sourceSecretName);
          log.info("strategyPullSecretName: " + strategyPullSecretName);
          if (!strategyPullSecretName && sourceSecretName) {
            Core.pathSet(spec, ["strategy", "customStrategy", "pullSecret", "name"], sourceSecretName);
          }

/*
          // TODO hack until the put deals with updates
          var metadata = entity.metadata;
          if (metadata) {
            delete metadata["resourceVersion"];
          }
*/

          log.info(angular.toJson(entity, true));

          $scope.buildConfigClient.put(entity, (obj) => {
            log.info("build config created!");

            var link = Developer.projectSecretsLink($scope.namespace, getName(entity));
            if (link) {
              log.info("Navigating to: "+ link);
              $location.path(link);
            } else {
              log.warn("Could not find the edit pipeline link!");
            }
          })
        };

        updateData();


        var jenkinsUrl = Developer.jenkinsLink();
        var jobName = "";

        function updateData() {
          $scope.item = null;
          if ($scope.id) {
            var url = buildConfigRestUrl($scope.id);
            $http.get(url).
              success(function (data, status, headers, config) {
                if (data) {
                  $scope.entity = data;

                  var buildConfig = angular.copy(data);
                  var sortedBuilds = null;
                  Kubernetes.enrichBuildConfig(buildConfig, sortedBuilds);
                  $scope.buildConfig = buildConfig;
                }
                $scope.spec = ($scope.entity || {}).spec || {};
                $scope.fetched = true;

                // lets update the tabs
                $scope.subTabConfig = Developer.createProjectSubNavBars($scope.projectId, null, $scope);
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

        function onSecrets(secrets) {
          var array = [];
          angular.forEach(secrets, (secret) => {
            var name = getName(secret);
            if (name) {
              array.push({
                label: name,
                value: name,
                "attributes": {
                  "title": name
                },
                $secret: secret
              });
            }
          });
          $scope.secrets = _.sortBy(array, "label");

          var specSourceSecretNamePath = ['spec', 'source', 'sourceSecret', 'name'];
          if (!Core.pathGet($scope.entity, specSourceSecretNamePath)) {
            var defaultSecretName = findDefaultImportSecretName(secrets);
            Core.pathSet($scope.entity, specSourceSecretNamePath, defaultSecretName);
          }
        }

        function findDefaultImportSecretName(secrets) {
          var answer = null;
          angular.forEach(secrets, (secret) => {
            var name = getName(secret);
            if (!answer && name && name.startsWith("jenkins-login")) {
              answer = name;
            }
          });
          if (!answer) {
            angular.forEach(secrets, (secret) => {
              var name = getName(secret);
              if (!answer && name && name.startsWith("jenkins-token")) {
                answer = name;
              }
            });
          }
          return answer;
        }

        $scope.specConfig = specConfig;
  });

}
