/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var ImageRepositoriesController = controller("ImageRepositoriesController", ["$scope", "KubernetesModel", "KubernetesBuilds", "KubernetesState", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
    ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesBuilds, KubernetesState, $dialog, $window, $templateCache, $routeParams, $location:ng.ILocationService, localStorage, $http, $timeout, KubernetesApiURL) => {

      $scope.kubernetes = KubernetesState;
      $scope.model = KubernetesModel;
      $scope.KubernetesBuilds = KubernetesBuilds;
      $scope.$on('kubernetesModelUpdated', function () {
        Core.$apply($scope);
      });

      $scope.tableConfig = {
        data: 'imageRepositories',
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
            displayName: 'Name'
          },
          {
            field: 'metadata.namespace',
            displayName: 'Namespace'
          },
          {
            field: 'status.dockerImageRepository',
            displayName: 'Docker Registry'
          },
          {
            field: 'tags',
            displayName: 'Tags'
          }
        ]
      };

      Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

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
          title: 'Delete Image Repository?',
          action: 'The following Image Repositories will be deleted:',
          okText: 'Delete',
          okClass: 'btn-danger',
          custom: "This operation is permanent once completed!",
          customClass: "alert alert-warning"
        }).open();
      };

      function deleteEntity(selection, nextCallback) {
        var name = (selection || {}).$name;
        if (name) {
          console.log("About to delete image repository: " + name);
          var url = imageRepositoryRestUrl(name);
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
        var url = imageRepositoriesRestURL;
        $http.get(url).
          success(function (data, status, headers, config) {
            if (data) {
              //console.log("got data " + angular.toJson(data, true));
              $scope.imageRepositories = enrichImageRepositories(data.items);
              $scope.fetched = true;
              Core.$apply($scope);
            }
          }).
          error(function (data, status, headers, config) {
            log.warn("Failed to load " + url + " " + data + " " + status);
          });
      }

      updateData();
    }]);
}
