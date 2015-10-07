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
        $scope.$on('$routeUpdate', ($event) => {
          updateData();
        });

        $scope.$on('kubernetesModelUpdated', function () {
          updateJenkinsLink();
          Core.$apply($scope);
        });


        updateData();

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

        function updateData() {
          if ($scope.jobId) {
            var inputData = {
              start: $scope.log.start
            };
            var config = {
              // lets avoid text losing the carriage returns
              transformResponse: (defaults) => {
                return defaults;
              }
            };
            var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(jenkinsServiceNameAndPort, UrlHelpers.join("job", $scope.jobId, $scope.buildId, "logText/progressiveHtml"));
            if (url && (!$scope.log.fetched || Kubernetes.keepPollingModel)) {
              $http.post(url, inputData, config).
                success(function (data, status, headers, config) {
                  if (data) {
                    $scope.log.html += data;
                    var length = data.length;
                    $scope.log.start != length;
                    updateJenkinsLink();
                    $scope.log.html = replaceClusterIPsInHtml($scope.log.html);
                    $scope.log.logs = $scope.log.html.split("\n");
                  }
                  $scope.log.fetched = true;
                  Core.$apply($scope);
                }).
                error(function (data, status, headers, config) {
                  log.warn("Failed to load " + url + " " + data + " " + status);
                });
            }
          } else {
            $scope.log.fetched = true;
            Core.$apply($scope);
          }
        }

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
