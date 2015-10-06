/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var PipelinesController = controller("PipelinesController",
    ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "ServiceRegistry",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, ServiceRegistry) => {

        $scope.kubernetes = KubernetesState;
        $scope.kubeModel = KubernetesModel;
        $scope.id = $routeParams["id"];
        $scope.jobId = $scope.jobId || $routeParams["job"];
        $scope.schema = KubernetesSchema;
        $scope.entityChangedCache = {};

        $scope.model = {
          job: null,
          pendingOnly: $scope.pendingPipelinesOnly
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

        $scope.$watch('model.pendingOnly', ($event) => {
          updateData();
        });

        updateData();

        function updateData() {
          if ($scope.jobId) {
            var queryPath = "fabric8/stages/";
            if ($scope.model.pendingOnly) {
              queryPath = "fabric8/pendingStages/";
            }
            var url = Kubernetes.kubernetesProxyUrlForService(KubernetesApiURL, jenkinsServiceNameAndPort, UrlHelpers.join("job", $scope.jobId, queryPath));
            if (url && (!$scope.model.job || Kubernetes.keepPollingModel)) {
              $http.get(url).
                success(function (data, status, headers, config) {
                  if (data) {
                    enrichJenkinsPipelineJob(data);
                    if (hasObjectChanged(data, $scope.entityChangedCache)) {
                      log.info("entity has changed!");
                      $scope.model.job = data;
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
