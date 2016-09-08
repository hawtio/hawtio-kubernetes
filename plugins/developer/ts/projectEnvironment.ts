/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var ProjectEnvironmentController = controller("ProjectEnvironmentController",
    ["$scope", "KubernetesModel", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "$element",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, $element) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;

        $scope.namespaceObjects = _.map(Kubernetes.isOpenShift ? $scope.model.projects : $scope.model.namespaces, (item) => {
          if (angular.isString(item)) {
            return {
              "$name": item
            };
          } else {
            if (!item["$name"]) {
              item["$name"] = Kubernetes.getName(item);
            }
            return item;
          }
        });

        ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.environmentsLink = environmentsLink();
        var children = [
          {
            href: $scope.environmentsLink,
            label: "Environments",
            title: "Back to the list of environment configurations for this project"
          }
        ];
        $scope.breadcrumbConfig = createProjectBreadcrumbs(null, children);
        $scope.subTabConfig = Developer.createWorkspaceSubNavBars();

        var env = $routeParams.env;

        $scope.entity = {};
        $scope.changed = false;

        var loadedEntity = false;

        var kubeClient = Kubernetes.createKubernetesClient("configmaps");
        $element.on('$destroy', () => {
          Kubernetes.destroyKubernetesClient(kubeClient);
        });

        $scope.schema = {
          type: "object",
          title: "Environment configuration",
          properties: {
            "key": {
              "type": "string",
              "description": "The unique key for this environment",
              "required": true,
            },
            "name": {
              "type": "string",
              "description": "The textual label for this environment",
              "required": true,
            },
            "namespace": {
              "type": "string",
              "label": "Project name",
              "description": "The project for this environment",
              "required": true,
              "input-attributes": {
                "typeahead": "title for $name in $parent.$parent.namespaceObjects | filter:$viewValue",
                "typeahead-editable": true
              }
            },
            "clusterURL": {
              "type": "string",
              "label": "Cluster URL",
              "description": "The Cluster URL if this environment is hosted on a separate Kubernetes cluster",
              "required": false
            }
          },
          required: ["key", "namespace", "name"]
        };

        angular.forEach($scope.schema.required, (name) => {
          Core.pathSet($scope.schema, ["properties", name, "input-attributes", "required"], true);
        });

        if (env) {
          // lets disable the "key" property in the form
          Core.pathSet($scope.schema, ["properties", "key", "input-attributes", "readonly"], true);
        } else {
          // doesn't seem to be able to see this $scope's checkKeyUnique() so lets use the entity watcher instead...
          //Core.pathSet($scope.schema, ["properties", "key", "input-attributes", "ui-validate"], "'checkKeyUnique($value)'");
        }

        $scope.$on('hawtio-form2-form', ($event, formInfo) => {
          if (formInfo.name === "entityForm") {
            $scope.form = formInfo.form;
          }
        });

        var changeCount = 0;
        $scope.$watchCollection("entity", () => {
          if (loadedEntity) {
            changeCount += 1;
            if (changeCount > 1) {
              $scope.changed = true;
            }
            if (!env) {
              var key = $scope.entity.key;
              $scope.validationMessage = "";
              if (key) {
                if (!$scope.checkKeyUnique(key)) {
                  $scope.validationMessage = "Key already in use!";
                }
              }
            }
          }
        });


        $scope.getRequiredFields = () => {
          // TODO no _.join() yet!
          //return _.join(_.map($scope.form.$error.required, $scope.getLabel), ", ");
          function join(array, separator = ", ") {
            var answer = "";
            angular.forEach(array, (value) => {
              if (value) {
                if (answer) {
                  answer += separator + value;
                } else {
                  answer = value;
                }
              }
            });
            return answer;
          }

          return join(_.map(Core.pathGet($scope, ["form", "$error", "required"]), (item) => $scope.getLabel(item['$name'])));
        };

        $scope.getLabel = (name:string) => {
          var property = $scope.schema.properties[name] || {};
          return property.label || property.title || _.capitalize(name);
        };

        $scope.checkKeyUnique = (value) => {
          var answer = true;
          angular.forEach($scope.model.environments, (environment) => {
            if (value === environment.key) {
              answer = false;
            }
          });
          return answer;
        };


        if (env) {
          loadEntity();

          if (!loadedEntity) {

            // lets load the entity once the model has loaded
            // if we hit reload on this page
            $scope.$on('kubernetesModelUpdated', loadEntity);
          }
        } else {
          hasLoaded();
        }

        $scope.save = () => {
          var data = {};
          angular.forEach($scope.entity, (value, key) => {
            if (angular.isString(key) && !_.startsWith(key, "$")) {
              data[key] = value;
            }
          });
          if (!env && !data["order"]) {
            var order = 0;
            var max = _.max(_.map($scope.model.environments, 'order'));
            if (angular.isNumber(max)) {
              order = <number> max;
            }
            data["order"] = 1 + order;
          }
          var key = data["key"];
          if (!key) {
            log.warn("No key defined in enviroment configuration: " + angular.toJson(data, false));
          } else {
            var yaml = jsyaml.safeDump(data);
            var configMap = Kubernetes.getNamed($scope.model.configmaps, Kubernetes.environemntsConfigMapName);
            if (!configMap) {
              configMap = {
                apiVersion: Kubernetes.defaultApiVersion,
                kind: "ConfigMap",
                metadata: {
                  name: Kubernetes.environemntsConfigMapName,
                  namespace: $scope.namespace,
                },
                data: {}
              };
            }
            configMap.data[key] = yaml;

            kubeClient.put(configMap, (data) => {
              log.info("Saved configmap!");
              $location.path($scope.environmentsLink);
            });
          }
        };

        function hasLoaded() {
          loadedEntity = true;
        }

        function loadEntity() {
          if (!loadedEntity) {
            angular.forEach($scope.model.environments, (environment) => {
              if (environment && env === environment.key) {
                $scope.entity = environment;
                hasLoaded();
              }
            });
          }
        }

      }]);
}
