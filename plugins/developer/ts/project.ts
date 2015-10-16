/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var ProjectController = controller("ProjectController",
    ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
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
        $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.id);
        $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id);

        // this is used for the pendingPipelines view
        $scope.jobId = $scope.id;
        $scope.pendingPipelinesOnly = true;

/*
        $scope.$on('kubernetesModelUpdated', function () {
          updateData();
        });

        $scope.$on('$routeUpdate', ($event) => {
          updateData();
        });
*/



        $scope.$keepPolling = () => Kubernetes.keepPollingModel;
        $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
          $scope.item = null;
          if ($scope.id) {
            var url = Kubernetes.buildConfigRestUrl($scope.id);
            if (!$scope.entity || Kubernetes.keepPollingModel) {
              $http.get(url).
                success(function (data, status, headers, config) {
                  if (data) {
                    var sortedBuilds = null;
                    Kubernetes.enrichBuildConfig(data, sortedBuilds);
                    if (hasObjectChanged(data, $scope.entityChangedCache)) {
                      log.info("entity has changed!");
                      $scope.entity = data;
                      $scope.entity.$build = (data.$fabric8CodeViews || {})['fabric8.link.browseGogs.view'];
                      $scope.model.setProject($scope.entity);
                    }
                    updateEnvironmentWatch();
                  }
                  $scope.model.fetched = true;
                  Core.$apply($scope);
                  next();
                }).
                error(function (data, status, headers, config) {
                  log.warn("Failed to load " + url + " " + data + " " + status);
                  next();
                });
            }
          } else {
            $scope.model.fetched = true;
            next();
            Core.$apply($scope);
          }
        });

        $scope.fetch();


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
              }
              loadProjectVersions($scope, $http, project, env, ns, $scope.envVersions, caches);
            });
          }
        }
      }]);
}
