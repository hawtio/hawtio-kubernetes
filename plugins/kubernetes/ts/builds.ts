/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var BuildsController = controller("BuildsController", ["$scope", "KubernetesModel", "KubernetesState", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
    ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, $dialog, $window, $templateCache, $routeParams, $location:ng.ILocationService, localStorage, $http, $timeout, KubernetesApiURL) => {

      $scope.kubernetes = KubernetesState;
      $scope.model = KubernetesModel;
      $scope.buildConfigId = $routeParams["id"];

      $scope.$on('kubernetesModelUpdated', function () {
        Core.$apply($scope);
      });

      $scope.tableConfig = {
        data: 'model.builds',
        showSelectionCheckbox: true,
        enableRowClickSelection: false,
        multiSelect: true,
        selectedItems: [],
        filterOptions: {
          filterText: $location.search()["q"] || ''
        },
        columnDefs: [
          {
            field: 'metadata.name',
            displayName: 'Name',
            cellTemplate: $templateCache.get("buildLinkTemplate.html")
          },
          {
            field: '$creationDate',
            displayName: 'Time',
            defaultSort: true,
            cellTemplate: $templateCache.get("buildTimeTemplate.html")
          },
          {
            field: 'status',
            displayName: 'Status',
            cellTemplate: $templateCache.get("buildStatusTemplate.html")
          },
          {
            field: '$logsLink',
            displayName: 'Logs',
            cellTemplate: $templateCache.get("buildLogsTemplate.html")
          },
          {
            field: '$podLink',
            displayName: 'Build Pod',
            cellTemplate: $templateCache.get("buildPodTemplate.html")
          },
/*
          {
            field: 'parameters.source.type',
            displayName: 'Source'
          },
*/
          {
            field: 'spec.source.git.uri',
            displayName: 'Repository',
            cellTemplate: $templateCache.get("buildRepositoryTemplate.html")
          },
          {
            field: 'spec.strategy.type',
            displayName: 'Strategy'
          },
          {
            field: 'spec.strategy.sourceStrategy.from.name',
            displayName: 'Source Image'
          },
          {
            field: 'spec.output.to.name',
            displayName: 'Output Image'
          }]
      };

      Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
      $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.buildConfigId);
      $scope.subTabConfig = Developer.createProjectSubNavBars($scope.buildConfigId, null, $scope);

      $scope.$on('kubernetesModelUpdated', function () {
        updateData();
      });

      function updateData() {
        if ($scope.model) {
          var builds = $scope.model.builds;
          var buildConfigId = $scope.buildConfigId;

          enrichBuilds(builds);
          $scope.fetched = true;

          if (buildConfigId) {
            $scope.buildConfig = $scope.model.getBuildConfig(buildConfigId);
          }
        }
      }

      updateData();


      /*
      $scope.$keepPolling = () => keepPollingModel;
      $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
        var url = buildsRestURL();
        $http.get(url).
          success(function (data, status, headers, config) {
            if (data) {
              //console.log("got data " + angular.toJson(data, true));
              $scope.builds = enrichBuilds(data.items);
              $scope.fetched = true;

              if ($scope.model) {
                $scope.buildConfig = $scope.model.getBuildConfig($scope.buildConfigId);
              }
            }
            Core.$apply($scope);
            next();
          }).
          error(function (data, status, headers, config) {
            log.warn("Failed to load " + url + " " + data + " " + status);
            Core.$apply($scope);
            next();
          });
      });

      $scope.fetch();
      */
    }]);
}
