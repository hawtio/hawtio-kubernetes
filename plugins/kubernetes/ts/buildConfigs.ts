/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var BuildConfigsController = controller("BuildConfigsController", ["$scope", "KubernetesModel", "KubernetesState", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
    ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, $dialog, $window, $templateCache, $routeParams, $location:ng.ILocationService, localStorage, $http, $timeout, KubernetesApiURL) => {

      $scope.kubernetes = KubernetesState;
      $scope.model = KubernetesModel;

      $scope.tableConfig = {
        data: 'model.buildconfigs',
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
/*
          {
            field: 'spec.source.type',
            displayName: 'Source'
          },
*/
          {
            field: 'spec.source.git.uri',
            displayName: 'Repository'
          },
/*
          {
            field: 'spec.strategy.type',
            displayName: 'Strategy'
          },
          {
            field: 'spec.strategy.stiStrategy.image',
            displayName: 'Source Image'
          },
          {
            field: 'spec.output.imageTag',
            displayName: 'Output Image'
          },
*/
          {
            field: '$fabric8CodeViews',
            displayName: 'Code',
            width: "***",
            minWidth: 500,
            cellTemplate: $templateCache.get("buildConfigCodeViewsTemplate.html")
          },
          {
            field: '$fabric8BuildViews',
            displayName: 'Builds',
            width: "***",
            minWidth: 500,
            cellTemplate: $templateCache.get("buildConfigBuildViewsTemplate.html")
          },
          {
            field: '$fabric8EnvironmentViews',
            displayName: 'Environments',
            width: "***",
            minWidth: 500,
            cellTemplate: $templateCache.get("buildConfigEnvironmentViewsTemplate.html")
          },
          {
            field: '$fabric8TeamViews',
            displayName: 'People',
            width: "***",
            minWidth: 500,
            cellTemplate: $templateCache.get("buildConfigTeamViewsTemplate.html")
          }
        ]
      };

      Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

      // TODO
      // $scope.isLoggedIntoGogs = Forge.isLoggedIntoGogs;

      $scope.deletePrompt = (selected) => {
        UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
          collection: selected,
          index: '$name',
          onClose: (result:boolean) => {
            if (result) {
              function deleteSelected(selected, next) {
                if (next) {
                  deleteEntity(next, () => {
                    deleteSelected(selected, selected.shift());
                  });
                } else {
                  updateData();
                }
              }

              deleteSelected(selected, selected.shift());
            }
          },
          title: 'Delete Build Configs?',
          action: 'The following Build Configs will be deleted:',
          okText: 'Delete',
          okClass: 'btn-danger',
          custom: "This operation is permanent once completed!",
          customClass: "alert alert-warning"
        }).open();
      };

      function deleteEntity(selection, nextCallback) {
        var name = (selection || {}).$name;
        if (name) {
          console.log("About to delete build config: " + name);
          var url = buildConfigRestUrl(name);
          $http.delete(url).
            success(function (data, status, headers, config) {
              nextCallback();
            }).
            error(function (data, status, headers, config) {
              log.warn("Failed to delete build config on " + url + " " + data + " " + status);
            });
        } else {
          console.log("warning: no name for selection: " + angular.toJson(selection));
        }
      }

      function updateData() {
      }

      updateData();
    }]);
}
