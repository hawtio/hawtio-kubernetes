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

        var loadedEntity = false;

        var kubeClient = Kubernetes.createKubernetesClient("configmaps");

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
              "required": true
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

        if (env) {
          // lets disable the "key" property in the form
          $scope.schema.properties.key.hidden = false;

          loadEntity();

          if (!loadedEntity) {

            // lets load the entity once the model has loaded
            // if we hit reload on this page
            $scope.$on('kubernetesModelUpdated', loadEntity);
          }
        }

;

        $scope.save = () => {
          var data = {};
          angular.forEach($scope.entity, (value, key) => {
            if (angular.isString(key) && !_.startsWith(key, "$")) {
              data[key] = value;
            }
          });
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
        function loadEntity() {
          if (!loadedEntity) {
            angular.forEach($scope.model.environments, (environment) => {
              if (environment && env === environment.key) {
                $scope.entity = environment;
                loadedEntity = true;
              }
            });
          }
        }

      }]);
}
