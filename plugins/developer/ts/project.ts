/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerHelpers.ts"/>

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

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.id);
        $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id);

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
            var url = Kubernetes.buildConfigRestUrl($scope.id);
            if (!$scope.entity || Kubernetes.keepPollingModel) {
              $http.get(url).
                success(function (data, status, headers, config) {
                  if (data) {
                    $scope.entity = data;
                    var sortedBuilds = null;
                    Kubernetes.enrichBuildConfig(data, sortedBuilds);
                    $scope.model.setProject($scope.entity);
                    updateEnvironmentWatch();
                  }
                  $scope.fetched = true;
                  Core.$apply($scope);
                }).
                error(function (data, status, headers, config) {
                  log.warn("Failed to load " + url + " " + data + " " + status);
                });
            }
          } else {
            $scope.fetched = true;
            Core.$apply($scope);
          }
        }


        /**
         * We have updated the entity so lets make sure we are watching all the environments to find
         * the project versions for each namespace
         */
        function updateEnvironmentWatch() {
          var project = $scope.entity;
          if (project) {
            angular.forEach(project.environments, (env) => {
              var ns = env.namespace;
              if (ns) {
                env.projectVersions = loadProjectVersions($scope, $http, project, env, ns);
              }
            });
          }
        }
      }]);
}
