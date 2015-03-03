/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var BuildConfigsController = controller("BuildConfigsController", ["$scope", "KubernetesModel", "KubernetesBuilds", "KubernetesState", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
    ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesBuilds, KubernetesState, $dialog, $window, $templateCache, $routeParams, $location:ng.ILocationService, localStorage, $http, $timeout, KubernetesApiURL) => {

      $scope.kubernetes = KubernetesState;
      $scope.model = KubernetesModel;
      $scope.KubernetesBuilds = KubernetesBuilds;
      $scope.$on('kubernetesModelUpdated', function () {
        Core.$apply($scope);
      });

      $scope.tableConfig = {
        data: 'buildConfigs',
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
            cellTemplate: $templateCache.get("buildConfigLinkTemplate.html")
          },
          {
            field: 'parameters.source.type',
            displayName: 'Source'
          },
          {
            field: 'parameters.source.git.uri',
            displayName: 'Repository'
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
          }
        ]
      };

      Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

      function updateData() {
        var url = buildConfigsRestURL;
        $http.get(url).
          success(function (data, status, headers, config) {
            if (data) {
              console.log("got data " + angular.toJson(data, true));
              var sortedBuilds = null;
              $scope.buildConfigs = enrichBuildConfigs(data.items, sortedBuilds);
              $scope.fetched = true;
            }
          }).
          error(function (data, status, headers, config) {
            log.warn("Failed to load " + url + " " + data + " " + status);
          });
      }

      updateData();
    }]);
}
