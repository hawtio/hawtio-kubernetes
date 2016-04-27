/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerPlugin.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var PipelinesController = _module.controller("Developer.PipelinesController", ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
        $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, ServiceRegistry, $element) => {

    $scope.kubernetes = KubernetesState;
    $scope.kubeModel = KubernetesModel;
    $scope.id = $routeParams["id"];
    $scope.jobId = $scope.jobId || $routeParams["job"];
    $scope.schema = KubernetesSchema;
    $scope.entityChangedCache = {};

    $element.on('$destroy', () => {
      $scope.$destroy();
    });

    $scope.model = {
      job: null,
      pendingOnly: $scope.pendingPipelinesOnly
    };
    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
    $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.id);
    $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id, $scope.jobId);

    $scope.selectBuild = (build) => {
      var id = build.id;
      if (id) {
        if (id !== $scope.selectedBuildId) {
          $scope.selectedBuildId = id;
          $scope.$broadcast("jenkinsSelectedBuild", build);
        }
      }
    };

    $scope.lastStage = (build):any => {
      if (build && build.stages && build.stages.length) {
        return _.last(build.stages);
      }
      // cater for no build stages
      if (build.building) {
        return {};
      } else {
        return {
          status: build.result,
          '$iconClass': createBuildStatusIconClass(build.result),
          '$backgroundClass': createBuildStatusBackgroundClass(build.result)
        };
      }
    }

    // http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    // set the top border color of each pipeline step
    $scope.borderStyle = (build, stage, $index) => {
      // #78DAF4
      var r = 120;
      var g = 218;
      var b = 244;
      r = Math.abs(r - ($index * 10));
      g = Math.abs(g - ($index * 10));
      b = Math.abs(b - ($index * 5));
      return {
        'border-color': rgbToHex(r, g, b)
      };
    }

    var updateData = _.debounce(() => {
      var entity = $scope.entity;
      if ($scope.jobId) {
        if ((!entity || entity.$jenkinsJob)) {
          var queryPath = "fabric8/stages/";
          if ($scope.model.pendingOnly) {
            queryPath = "fabric8/pendingStages/";
          }
          var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(jenkinsServiceNameAndPort, UrlHelpers.join("job", $scope.jobId, queryPath));
          if (url && (!$scope.model.job || Kubernetes.keepPollingModel)) {
            $http.get(url).
            success(function (data, status, headers, config) {
              if (data) {
                enrichJenkinsPipelineJob(data, $scope.id, $scope.jobId);
                if (hasObjectChanged(data, $scope.entityChangedCache)) {
                  log.debug("Job data has changed");
                  // log.info("entity has changed!");
                  $scope.model.job = data;
                  var builds = data.builds;
                  if (builds && builds.length) {
                    $scope.selectBuild(builds[0]);
                  }
                }
              }
              $scope.model.fetched = true;
            }).
            error(function (data, status, headers, config) {
              log.warn("Failed to load " + url + " " + data + " " + status);
              $scope.model.fetched = true;
            });
          }
        } else {
          if ($scope.model) {
            Kubernetes.enrichBuilds($scope.kubeModel.builds);

            var builds = [];
            angular.forEach($scope.kubeModel.builds, (build) => {
              var labels = Kubernetes.getLabels(build);
              var app = labels["app"];
              if (app === $scope.projectId) {
                builds.push(build);
              }
            });
            builds = _.sortBy(builds, "$creationDate").reverse();
            var allBuilds = builds;
            if (allBuilds.length > 1) {
              builds = _.filter(allBuilds, (b) => !b.$creationDate);
              if (!builds.length) {
                builds = [allBuilds[0]];
              }
            }
            var pipelines = [];
            angular.forEach(builds, (build) => {
              var buildStatus = build.status || {};
              var result = buildStatus.phase || "";
              var resultUpperCase = result.toUpperCase();

              var description = "";
              var $viewLink = build.$viewLink;
              var $logLink = build.$logsLink;
              var $timestamp = build.$creationDate;
              var duration = buildStatus.duration;
              if (duration) {
                // 17s = 17,000,000,000 on openshift
                duration = duration / 1000000;
              }
              var displayName = Kubernetes.getName(build);
              var $iconClass = createBuildStatusIconClass(resultUpperCase);
              var $backgroundClass = createBuildStatusBackgroundClass(resultUpperCase);
              var stage = {
                stageName: "OpenShift Build",
                $viewLink: $viewLink,
                $logLink: $logLink,
                $startTime: $timestamp,
                duration: duration,
                status: result,
                $iconClass: $iconClass,
                $backgroundClass: $backgroundClass
              };
              var pipeline = {
                description: description,
                displayName: displayName,
                $viewLink: $viewLink,
                $logLink: $logLink,
                $timestamp: $timestamp,
                duration: duration,
                stages: [stage]
              };
              pipelines.push(pipeline);
            });

            // lets filter the OpenShift builds and make a pipeline from that
            $scope.model.job = {
              $jobId: $scope.jobId,
              $project: $scope.projectId,
              builds: pipelines
            };
          }
          $scope.model.fetched = true;
          Core.$apply($scope);
        }
      } else {
        $scope.model.fetched = true;
        Core.$apply($scope);
      }
    }, 50, { trailing: true });

    $scope.$on('logViewPollUpdate', () => {
      updateData();
    });

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

  });
}
