/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var JenkinsJobsController = controller("JenkinsJobsController",
    ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "ServiceRegistry",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, ServiceRegistry) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;
        $scope.id = $routeParams["id"];
        $scope.schema = KubernetesSchema;
        $scope.jenkins = null;
        $scope.entityChangedCache = {};

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.breadcrumbConfig = createProjectBreadcrumbs();
        $scope.subTabConfig = Developer.createWorkspaceSubNavBars();

        $scope.$on('kubernetesModelUpdated', function () {
          updateData();
        });

        $scope.$on('$routeUpdate', ($event) => {
          updateData();
        });

        $scope.tableConfig = {
          data: 'jenkins.jobs',
          showSelectionCheckbox: true,
          enableRowClickSelection: false,
          multiSelect: true,
          selectedItems: [],
          filterOptions: {
            filterText: $location.search()["q"] || ''
          },
          columnDefs: [
            {
              field: 'name',
              displayName: 'Name',
              cellTemplate: $templateCache.get("jenkinsJobNameTemplate.html")
            },
            {
              field: '$buildLink',
              displayName: 'Views',
              cellTemplate: $templateCache.get("jenkinsJobButtonsTemplate.html")
            },
            {
              field: '$lastSuccessfulBuildNumber',
              displayName: 'Last Success',
              cellTemplate: $templateCache.get("jenkinsLastSuccessTemplate.html")
            },
            {
              field: '$lastFailedlBuildNumber',
              displayName: 'Last Failure',
              cellTemplate: $templateCache.get("jenkinsLastFailureTemplate.html")
            },
            {
              field: '$duration',
              displayName: 'Last Duration',
              cellTemplate: $templateCache.get("jenkinsBuildDurationTemplate.html")
            },
            {
              field: '$timestamp',
              displayName: 'Time Started',
              cellTemplate: $templateCache.get("jenkinsBuildTimestampTemplate.html")
            }
          ]
        };
        updateData();


        function updateData() {
          // TODO only need depth 2 to be able to fetch the lastBuild
          var url = Kubernetes.kubernetesProxyUrlForService(KubernetesApiURL, jenkinsServiceNameAndPort, "api/json?depth=2");
          log.info("")
          if (url && (!$scope.jenkins || Kubernetes.keepPollingModel)) {
            $http.get(url).
              success(function (data, status, headers, config) {
                if (data) {
                  enrichJenkinsJobs(data, $scope.id);
                  if (hasObjectChanged(data, $scope.entityChangedCache)) {
                    log.info("entity has changed!");
                    $scope.jenkins = data;
                  }
                }
                $scope.model.fetched = true;
                Core.$apply($scope);
              }).
              error(function (data, status, headers, config) {
                log.warn("Failed to load " + url + " " + data + " " + status);
              });
          }
        }
      }]);
}
