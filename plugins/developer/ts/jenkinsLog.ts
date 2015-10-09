/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var JenkinsLogController = controller("JenkinsLogController",
    ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "ServiceRegistry",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, ServiceRegistry) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;

        $scope.id = $routeParams["id"];
        $scope.jobId = $routeParams["job"];
        $scope.buildId = $routeParams["build"];
        $scope.schema = KubernetesSchema;
        $scope.entityChangedCache = {};

        $scope.log = {
          html: "",
          start: 0
        };

        $scope.$on('kubernetesModelUpdated', function () {
          updateJenkinsLink();
          Core.$apply($scope);
        });


        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.breadcrumbConfig = createJenkinsBreadcrumbs($scope.id, $scope.jobId, $scope.buildId);
        $scope.subTabConfig = createJenkinsSubNavBars($scope.id, $scope.jobId, $scope.buildId, {
          label: "Log",
          title: "Views the logs of this build"
        });


        function updateJenkinsLink() {
          var jenkinsUrl = jenkinsLink();
          if (jenkinsUrl) {
            $scope.$viewJenkinsBuildLink = UrlHelpers.join(jenkinsUrl, "job", $scope.jobId, $scope.buildId);
            $scope.$viewJenkinsLogLink = UrlHelpers.join($scope.$viewJenkinsBuildLink, "console");
          }
        }

        var querySize = 50000;

        $scope.$keepPolling = () => Kubernetes.keepPollingModel;
        $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
          if ($scope.jobId) {
            var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(jenkinsServiceNameAndPort, UrlHelpers.join("job", $scope.jobId, $scope.buildId, "fabric8/log?start=" + $scope.log.start + "&size=" + querySize));
            if (url && (!$scope.log.fetched || Kubernetes.keepPollingModel)) {
              $http.get(url).
                success(function (data, status, headers, config) {
                  if (data) {
                    if (!$scope.log.logs) {
                      $scope.log.logs = [];
                    }
                    var lines = data.lines;
                    var textSize = data.textSize;
                    var logLength = data.logLength;
                    //log.debug("start was: " + $scope.log.start + " got textSize: " + textSize + " logLength: " + logLength);
                    if (textSize) {
                      $scope.log.start += (textSize - $scope.log.start);
                      if (logLength && $scope.log.start > logLength) {
                        $scope.log.start = logLength;
                      }
                    }
                    if (lines) {
                      var currentLogs = $scope.log.logs;
                      var lastIndex = currentLogs.length - 1;

                      // lets re-join split lines
                      if (data.lineSplit && lastIndex >= 0) {
                        var restOfLine = lines.shift();
                        if (restOfLine) {
                          currentLogs[lastIndex] += restOfLine;
                        }
                      }
                      $scope.log.logs = currentLogs.concat(lines);
                    }
                    updateJenkinsLink();
                  }
                  $scope.log.fetched = true;
                  Core.$apply($scope);
                  next();
                }).
                error(function (data, status, headers, config) {
                  log.warn("Failed to load " + url + " " + data + " " + status);
                });
            }
          } else {
            $scope.log.fetched = true;
            Core.$apply($scope);
            next();

          }
        });

        $scope.fetch();



        /** lets remove the URLs using the local service IPs and use the external host names instead */
        function replaceClusterIPsInHtml(html) {
          if (html) {
            angular.forEach($scope.model.services, (service) => {
              // TODO lets do a search and replace on the clusterIPs to the host URLs
            });
          }
          return html;
        }
      }]);
}
