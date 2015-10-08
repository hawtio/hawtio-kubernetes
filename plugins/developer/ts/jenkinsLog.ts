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


        $scope.$keepPolling = () => Kubernetes.keepPollingModel;
        $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
          if ($scope.jobId) {
            var inputData = {
              start: $scope.log.start
            };
            var config = {
              // lets avoid text losing the carriage returns
              transformResponse: (defaults, value) => {
                return defaults;
              }
            };
            var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(jenkinsServiceNameAndPort, UrlHelpers.join("job", $scope.jobId, $scope.buildId, "logText/progressiveHtml"));
            if (url && (!$scope.log.fetched || Kubernetes.keepPollingModel)) {
              log.info("About to query from start: " + inputData.start);

              $http.post(url, inputData, config).
                success(function (data, status, headers, config) {
                  if (data) {
                    var length = headers("X-Text-Size");
                    log.info("length header is " + length);
                    if (!length) {
                      length = data.length;
                      log.info("length is " + length);
                    }
                    $scope.log.html = $scope.log.html + data;
                    $scope.log.start += length;
                    updateJenkinsLink();
                    $scope.log.html = replaceClusterIPsInHtml($scope.log.html);
                    $scope.log.logs = $scope.log.html.split("\n");
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
