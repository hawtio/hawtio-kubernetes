/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var JenkinsMetricsController = controller("JenkinsMetricsController",
    ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "ServiceRegistry",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, ServiceRegistry) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;
        $scope.id = $routeParams["id"];
        $scope.jobId = $routeParams["job"];
        $scope.schema = KubernetesSchema;
        $scope.jenkins = null;
        $scope.entityChangedCache = {};

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.id);
        $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id, $scope.jobId);

        $scope.$on('kubernetesModelUpdated', function () {
          updateData();
        });

        $scope.$on('$routeUpdate', ($event) => {
          updateData();
        });

        $scope.options = {
          chart: {
/*
            type: 'discreteBarChart',
*/
            type: 'multiBarChart',
            autorefresh: false,
            height: 450,
            margin: {
              top: 20,
              right: 20,
              bottom: 60,
              left: 45
            },
            clipEdge: true,
            staggerLabels: false,
            transitionDuration: 500,
            stacked: true,
            interactive: true,
            tooltip: {
              enabled: true,
              contentGenerator: (args) => {
                var data = args.data || {};
                return data.tooltip;
              },
            },
/*
            tooltipContent: (args) => {
              var data = args.data || {};
              return data.tooltip;
            },
*/
            xAxis: {
              axisLabel: 'Builds',
              showMaxMin: false,
              tickFormat: function (d) {
                return "#" + d;
                //return new Date(d).relative();
              }
            },
            yAxis: {
              axisLabel: 'Build Duration (seconds)',
              tickFormat: function (d) {
                return d3.format(',.1f')(d);
              }
            }
          }
        };

        $scope.data = [];

        updateData();

        function updateChartData() {
          var buildsSucceeded = [];
          var buildsFailed = [];
          var successBuildKey = "Succeeded builds";
          var failedBuildKey = "Failed builds";

          var builds = _.sortBy($scope.metrics.builds || [], "number");
          angular.forEach(builds, (build) => {
            var x = build.number;
            var y = build.duration / 1000;
            var date = Developer.asDate(build.timeInMillis);
            var tooltip = '<h3>build ' + build.displayName + '</h3>' +
              '<p>duration: <b>' + y + '</b> seconds</p>';
            if (date) {
              tooltip += '<p>started: <b>' + date + '</b></p>';
            }

            if (x) {
              var data = buildsSucceeded;
              var key = successBuildKey;
              if (!build.result || !build.result.startsWith("SUCC")) {
                data = buildsFailed;
                key = failedBuildKey;
              }
              data.push({
                tooltip: tooltip,
                x: x, y: y});
            }
          });
          $scope.data = [];
          if (buildsSucceeded.length) {
            $scope.data.push({
              key: successBuildKey,
              values: buildsSucceeded
            });
          }
          if (buildsFailed.length) {
            $scope.data.push({
              key: failedBuildKey,
              values: buildsFailed
            });
          }
          $scope.api.updateWithData($scope.data);

          $timeout(() => {
            $scope.api.update();
          }, 50);
        }

        function updateData() {
          var metricsPath = $scope.jobId ? UrlHelpers.join("job", $scope.jobId, "fabric8/metrics") : "fabric8/metrics";
          var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(jenkinsServiceNameAndPort, metricsPath);
          log.info("");
          if (url && (!$scope.jenkins || Kubernetes.keepPollingModel)) {
            $http.get(url, jenkinsHttpConfig).
              success(function (data, status, headers, config) {
                if (data) {
                  if (hasObjectChanged(data, $scope.entityChangedCache)) {
                    log.info("entity has changed!");
                    $scope.metrics = data;
                    updateChartData();
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
