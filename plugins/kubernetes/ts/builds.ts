/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var BuildsController = controller("BuildsController", ["$scope", "KubernetesModel", "KubernetesBuilds", "KubernetesState", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
    ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesBuilds, KubernetesState, $dialog, $window, $templateCache, $routeParams, $location:ng.ILocationService, localStorage, $http, $timeout, KubernetesApiURL) => {

      $scope.kubernetes = KubernetesState;
      $scope.model = KubernetesModel;
      $scope.KubernetesBuilds = KubernetesBuilds;
      $scope.$on('kubernetesModelUpdated', function () {
        Core.$apply($scope);
      });

      $scope.tableConfig = {
        data: 'builds',
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
            field: 'parameters.source.git.uri',
            displayName: 'Repository',
            cellTemplate: $templateCache.get("buildRepositoryTemplate.html")
          },
          {
            field: 'parameters.strategy.type',
            displayName: 'Strategy'
          },
          {
            field: 'parameters.strategy.stiStrategy.image',
            displayName: 'Source Image'
          },
          {
            field: 'parameters.output.imageTag',
            displayName: 'Output Image'
          }]
      };

      Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

      $scope.$keepPolling = () => keepPollingModel;
      $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
        var url = buildsRestURL;
        $http.get(url).
          success(function (data, status, headers, config) {
            if (data) {
              //console.log("got data " + angular.toJson(data, true));
              $scope.builds = enrichBuilds(data.items);
              $scope.fetched = true;
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
    }]);
}
