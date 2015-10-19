/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var Services = controller("Services",
    ["$scope", "KubernetesModel", "KubernetesServices", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesServices:ng.resource.IResourceClass, KubernetesPods:ng.resource.IResourceClass, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;

    ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');

    $scope.tableConfig = {
      data: 'model.services',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      filterOptions: {
        filterText: $location.search()["q"] || ''
      },
      columnDefs: [
        { field: '_key',
          displayName: 'Name',
          cellTemplate: $templateCache.get("idTemplate.html")
        },
        { field: '$serviceUrl',
          displayName: 'Address',
          cellTemplate: $templateCache.get("portalAddress.html")
        },
        { field: '$podCount',
          displayName: 'Pods',
          cellTemplate: $templateCache.get("podCountsAndLinkTemplate.html"),
          customSortField: (field) => {
            // need to concat all the pod counters
            var ready = field.$podCounters.ready || 0;
            var valid = field.$podCounters.valid || 0;
            var waiting = field.$podCounters.waiting || 0;
            var error = field.$podCounters.error || 0;
            return ready + valid + waiting + error;
          }
        },
        { field: '$selectorText',
          displayName: 'Selector',
          cellTemplate: $templateCache.get("selectorTemplate.html")
        },
        { field: '$labelsText',
          displayName: 'Labels',
          cellTemplate: $templateCache.get("labelTemplate.html")
        }
      ]
    };

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    $scope.deletePrompt = (selected) => {
      if (angular.isString(selected)) {
        selected = [{
          id: selected
        }];
      }
      UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
        collection: selected,
        index: 'metadata.name',
        onClose: (result:boolean) => {
          if (result) {
            function deleteSelected(selected:Array<KubePod>, next:KubePod) {
              if (next) {
                log.debug("deleting: ", getName(next));
                KubernetesServices.delete({
                  id: getName(next)
                }, undefined, () => {
                  log.debug("deleted: ", getName(next));
                  deleteSelected(selected, selected.shift());
                }, (error) => {
                  log.debug("Error deleting: ", error);
                  deleteSelected(selected, selected.shift());
                });
              }
            }
            deleteSelected(selected, selected.shift());
          }
        },
        title: 'Delete services?',
        action: 'The following services will be deleted:',
        okText: 'Delete',
        okClass: 'btn-danger',
        custom: "This operation is permanent once completed!",
        customClass: "alert alert-warning"
      }).open();
    };

  }]);
}
