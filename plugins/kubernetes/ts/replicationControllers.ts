/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var ReplicationControllers = controller("ReplicationControllers",
    ["$scope", "KubernetesModel", "KubernetesReplicationControllers", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesReplicationControllers:ng.resource.IResourceClass<any>, KubernetesPods:ng.resource.IResourceClass<any>, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;

    $scope.tableConfig = {
      data: 'model.replicationControllers',
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
        { field: '$replicas',
          displayName: 'Scale',
          cellTemplate:$templateCache.get("desiredReplicas.html")
        },
        { field: '$labelsText',
          displayName: 'Labels',
          cellTemplate: $templateCache.get("labelTemplate.html")
        },
        { field: '$eventCount',
          displayName: 'Events',
          cellTemplate: $templateCache.get("eventSummaryTemplate.html")
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
                KubernetesReplicationControllers.delete({
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
        title: 'Delete replication controllers?',
        action: 'The following replication controllers will be deleted:',
        okText: 'Delete',
        okClass: 'btn-danger',
        custom: "This operation is permanent once completed!",
        customClass: "alert alert-warning"
      }).open();
    };
  }]);
}
