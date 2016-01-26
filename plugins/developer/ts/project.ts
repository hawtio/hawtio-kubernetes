/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var ProjectController = controller("ProjectController",
    ["$scope", "$element", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, $element, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;
        $scope.id = $routeParams["id"];

        $scope.schema = KubernetesSchema;
        $scope.config = KubernetesSchema.definitions.os_build_BuildConfig;
        $scope.entityChangedCache = {};
        $scope.envVersionsCache = {};
        $scope.envNSCaches = {};
        $scope.envVersions = {};

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.breadcrumbConfig = []; //Developer.createProjectBreadcrumbs($scope.id);
        updateTabs();
        // this is used for the pendingPipelines view
        $scope.jobId = $scope.id;
        $scope.pendingPipelinesOnly = true;

        $scope.$on('jenkinsSelectedBuild', (event, build) => {
          $scope.selectedBuild = build;
        });

        // TODO this should be unnecessary but seems sometiems this watch doesn't always trigger unless you hit reload on this page
        if ($scope.model.buildconfigs) {
          onBuildConfigs($scope.model.buildconfigs);
        }
        Kubernetes.watch($scope, $element, "buildconfigs", $scope.namespace, onBuildConfigs);

        function onBuildConfigs(buildConfigs) {
          angular.forEach(buildConfigs, (data) => {
            var name = Kubernetes.getName(data);
            if (name === $scope.id) {
              var sortedBuilds = null;
              Kubernetes.enrichBuildConfig(data, sortedBuilds);
              if (hasObjectChanged(data, $scope.entityChangedCache)) {
                log.info("entity has changed!");
                $scope.entity = data;
                $scope.entity.$build = (data.$fabric8CodeViews || {})['fabric8.link.browseGogs.view'];
                $scope.model.setProject($scope.entity);
              }
              updateEnvironmentWatch();
              updateTabs();
            }
          });
          $scope.model.fetched = true;
          Core.$apply($scope);
        }


        /**
         * We have updated the entity so lets make sure we are watching all the environments to find
         * the project versions for each namespace
         */
        function updateEnvironmentWatch() {
          var project = $scope.entity;
          if (project) {
            var jenkinsJob = project.$jenkinsJob;
            if (jenkinsJob) {
              var buildsTab = _.find($scope.subTabConfig, {id: "builds"});
              if (buildsTab) {
                buildsTab["href"] = UrlHelpers.join("/workspaces", Kubernetes.currentKubernetesNamespace(), "projects", $scope.id, "jenkinsJob", jenkinsJob);
              }
            }

            angular.forEach(project.environments, (env) => {
              var ns = env.namespace;
              var caches = $scope.envNSCaches[ns];
              if (!caches) {
                caches = {};
                $scope.envNSCaches[ns] = caches;
                loadProjectVersions($scope, $element, project, env, ns, $scope.envVersions, caches);
              }
            });
          }
        }

        function updateTabs() {
          $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id, null, $scope);
        }

      }]);
}
