/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var ProjectDashboardController = controller("ProjectDashboardController",
    ["$scope", "KubernetesModel", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "$element",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, $element) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;

        ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.breadcrumbConfig = createProjectBreadcrumbs();
        $scope.subTabConfig = Developer.createWorkspaceSubNavBars();

        $scope.entityChangedCache = {};
        $scope.envVersionsCache = {};
        $scope.envNSCaches = {};
        $scope.envVersions = {};
        $scope.envCharts = {};
        $scope.environments = [];

        $scope.totalPodCount = 0;
        $scope.summaryChartConfig = createChartConfig("All", "summaryChart");

        $scope.environmentLink = (env) => {
          return environmentInstanceLink(env);
        };

        $scope.$on('kubernetesModelUpdated', function () {
          updateData();
        });

        $scope.$on('$routeUpdate', ($event) => {
          updateData();
        });

        function updateData() {
          $scope.environments = $scope.model.environments;
          updateEnvironmentWatch();
          //updateTabs();
          $scope.model.fetched = true;
          Core.$apply($scope);
        }

        updateData();

        /**
         * We have updated the entity so lets make sure we are watching all the environments to find
         * the project versions for each namespace
         */
        function updateEnvironmentWatch() {
          var project = null;
          var projectNamespace = $scope.namespace || Kubernetes.currentKubernetesNamespace();
          angular.forEach($scope.environments, (env) => {
            var ns = env.namespace;
            var caches = $scope.envNSCaches[ns];
            if (!caches) {
              caches = {};
              $scope.envNSCaches[ns] = caches;
              loadProjectVersions($scope, $element, project, env, ns, $scope.envVersions, caches, projectNamespace, updateCharts);
            }
          });
        }

        function updateTabs() {
          $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id, null, $scope);
        }

        function updateCharts() {
          var summaryColumns = [];
          var totalPodCount = 0;

          angular.forEach($scope.environments, (env) => {
            var podCount = 0;
            var envNamespace = env.namespace;
            var appCounters = {};

            angular.forEach($scope.envVersions[envNamespace], (versions, projectName) => {
              angular.forEach(versions.versions, (versionInfo, versionName) => {
                angular.forEach(versionInfo.replicationControllers, (rc) => {
                  var podCounters = rc.$podCounters;
                  if (podCounters) {
                    var ready = podCounters.ready;
                    if (ready) {
                      podCount += ready;
                      appCounters[projectName] = (appCounters[projectName] || 0) + ready;
                    }
                  }
                });
              });
            });

            var envChart = $scope.envCharts[envNamespace];
            if (!envChart) {
              envChart = createChartConfig(env.label, envNamespace + "Chart");
              $scope.envCharts[envNamespace] = envChart;
            }
            var envColumns = [];
            angular.forEach(appCounters, (count, projectName) => {
              envColumns.push([projectName, count]);
            });
            envChart.data.columns = envColumns;

            summaryColumns.push([env.label, podCount]);
            totalPodCount += podCount;
          });
          $scope.summaryChartConfig.data.columns = summaryColumns;
          $scope.totalPodCount = totalPodCount;
        }

        function createChartConfig(title, id, legend = false) {
          return {
            "donut": {
              "title": title,
              "label": {
                "show": false
              },
              "width": 11
            },
            "size": {
              "width": 171,
              "height": 171
            },
            "legend": {
              "show": legend
            },
            "color": {
              "pattern": [
                "#3b0083",
                "#007a87",
                "#0088ce",
                "#d1d1d1"
              ]
            },
            "tooltip": {
              "show": true
            },
            "data": {
              "type": "donut",
              "columns": [],
              "groups": [
                [
                  "used",
                  "available"
                ]
              ],
              "order": null
            },
            "bindto": "#" + id
          };
        }

      }]);
}
