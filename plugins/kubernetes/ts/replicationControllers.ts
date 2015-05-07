/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var ReplicationControllers = controller("ReplicationControllers",
    ["$scope", "KubernetesModel", "KubernetesReplicationControllers", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "jolokia", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesReplicationControllers:ng.IPromise<ng.resource.IResourceClass>, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, jolokia:Jolokia.IJolokia, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    $scope.replicationControllers = [];

    /*
    $scope.$on('kubernetesModelUpdated', function () {
      Core.$apply($scope);
    });
    */
    $scope.$watch('model.replicationControllers', (newValue, oldValue) => {
      var newValue = KubernetesModel.replicationControllers;
/*
      TODO on v1beta3 this seems to only show 1 RC :)

      if (newValue && newValue.length > 0 && _.first(newValue)['$podCounters']) {
        ArrayHelpers.sync($scope.replicationControllers, newValue);
      } else {
        console.log("Not updating model for " + newValue.length);
      }
*/
      $scope.replicationControllers = newValue;
    }, true);

    $scope.tableConfig = {
      data: 'replicationControllers',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      filterOptions: {
        filterText: $location.search()["q"] || ''
      },
      columnDefs: [
        { field: 'id', displayName: 'ID', cellTemplate: $templateCache.get("idTemplate.html") },
        { field: '$podsLink', displayName: 'Pods', cellTemplate: $templateCache.get("podCountsAndLinkTemplate.html") },
        { field: 'desiredState.replicas', displayName: 'Replicas', cellTemplate:$templateCache.get("desiredReplicas.html") },
        { field: 'labelsText', displayName: 'Labels', cellTemplate: $templateCache.get("labelTemplate.html") },
        { field: 'namespace', displayName: 'Namespace' }
      ]
    };

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    KubernetesReplicationControllers.then((KubernetesReplicationControllers:ng.resource.IResourceClass) => {
      KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {
        $scope.deletePrompt = (selected) => {
          if (angular.isString(selected)) {
            selected = [{
              id: selected
            }];
          }
          UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
            collection: selected,
            index: 'id',
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
      });
    });

    function maybeInit() {
    }
  }]);
}
