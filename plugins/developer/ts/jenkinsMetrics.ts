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
            type: 'discreteBarChart',
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
            stacked: false,
            interactive: true,
            tooltip: {
              enabled: true,
              contentGenerator: (args) => {
                var data = args.data || {};
                return data.tooltip;
              },
            },
            color: (d, i) => {
              return d.color;
            },
            xAxis: {
              axisLabel: 'Builds',
              showMaxMin: false,
              tickFormat: function (d) {
                return "#" + d;
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

        function barColourForBuildResult(result) {
          if (result) {
            if (result === "FAILURE" || result === "FAILED") {
              return "red";
            } else if (result === "ABORTED" || result === "INTERUPTED") {
              return "tan";
            } else if (result === "SUCCESS") {
              return "green";
            } else if (result === "NOT_STARTED") {
              return "lightgrey"
            }
          }
          return "darkgrey";
        }


        function updateChartData() {
          var useSingleSet = true;
          var buildsSucceeded = [];
          var buildsFailed = [];
          var successBuildKey = "Succeeded builds";
          var failedBuildKey = "Failed builds";

          if (useSingleSet) {
            successBuildKey = "Builds";
          }

          var count = 0;
          var builds = _.sortBy($scope.metrics.builds || [], "number");
          angular.forEach(builds, (build:any) => {
            var x = build.number;
            var y = build.duration / 1000;
            var date = Developer.asDate(build.timeInMillis);
            var result = build.result || "NOT_STARTED";
            var color = barColourForBuildResult(result);
            var iconClass = HawtioPipelineView.createBuildStatusIconClass(result);
            var tooltip = '<h3><i class="' + iconClass + '"></i> ' + build.displayName + '</h3>' +
              '<p>duration: <b>' + y + '</b> seconds</p>';
            if (date) {
              tooltip += '<p>started: <b>' + date + '</b></p>';
            }
            if (result) {
              tooltip += '<p>result: <b>' + result + '</b></p>';
            }

            if (x) {
              var data = buildsSucceeded;
              var key = successBuildKey;
              if (!successBuildKey && (!result || !result.startsWith("SUCC"))) {
                data = buildsFailed;
                key = failedBuildKey;
              }
              data.push({
                tooltip: tooltip,
                color: color,
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
