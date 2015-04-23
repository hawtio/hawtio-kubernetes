/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var Services = controller("Services",
    ["$scope", "KubernetesModel", "KubernetesServices", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "jolokia", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesServices:ng.IPromise<ng.resource.IResourceClass>, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, jolokia:Jolokia.IJolokia, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    $scope.services = [];

    $scope.$watch('model.services', (newValue, oldValue) => {
      if (newValue && newValue.length > 0 && _.first(newValue)['$podCounters']) {
        ArrayHelpers.sync($scope.services, newValue);
      } 
    }, true);

    $scope.tableConfig = {
      data: 'services',
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
        { field: 'selector', displayName: 'Selector', cellTemplate: $templateCache.get("selectorTemplate.html") },
        { field: 'portalIP', displayName: 'Address', cellTemplate: $templateCache.get("portalAddress.html") },
        { field: 'labelsText', displayName: 'Labels', cellTemplate: $templateCache.get("labelTemplate.html") },
        { field: 'namespace', displayName: 'Namespace' }
      ]
    };

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    KubernetesServices.then((KubernetesServices:ng.resource.IResourceClass) => {
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
                    log.debug("deleting: ", next.id);
                    KubernetesServices.delete({
                      id: next.id
                    }, undefined, () => {
                      log.debug("deleted: ", next.id);
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
      });
    });

  }]);
}
