/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var PipelineController = controller("PipelineController",
    ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "ServiceRegistry",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, ServiceRegistry) => {

        $scope.kubernetes = KubernetesState;
        $scope.kubeModel = KubernetesModel;
        $scope.id = $routeParams["id"];
        $scope.jobId = $routeParams["job"];
        $scope.buildId = $routeParams["build"];
        $scope.schema = KubernetesSchema;
        $scope.entityChangedCache = {};

        $scope.model = {
          stages: null
        };
        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.id);
        $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id, $scope.jobId);

        $scope.$on('kubernetesModelUpdated', function () {
          updateData();
        });

        $scope.$on('$routeUpdate', ($event) => {
          updateData();
        });

        updateData();

        function updateData() {
          if ($scope.jobId) {
            var url = Kubernetes.kubernetesProxyUrlForService(KubernetesApiURL, jenkinsServiceName, UrlHelpers.join("job", $scope.jobId, $scope.buildId, "fabric8/stages/"));
            if (url && (!$scope.model.stages || Kubernetes.keepPollingModel)) {
              $http.get(url).
                success(function (data, status, headers, config) {
                  if (data) {
                    enrichJenkinsStages(data);
                    if (hasObjectChanged(data, $scope.entityChangedCache)) {
                      log.info("entity has changed!");
                      $scope.build = data;
                      $scope.model.stages = data.stages;
                    }
                  }
                  $scope.model.fetched = true;
                  Core.$apply($scope);
                }).
                error(function (data, status, headers, config) {
                  log.warn("Failed to load " + url + " " + data + " " + status);
                });
            }
          } else {
            $scope.model.fetched = true;
            Core.$apply($scope);
          }
        }
      }]);
}
