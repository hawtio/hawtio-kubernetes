/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var Services = controller("Services",
    ["$scope", "KubernetesModel", "KubernetesServices", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "jolokia", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesServices:ng.resource.IResourceClass, KubernetesPods:ng.resource.IResourceClass, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, jolokia:Jolokia.IJolokia, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;

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
        { field: 'metadata.name', displayName: 'ID', cellTemplate: $templateCache.get("idTemplate.html") },
        { field: 'spec.portalIP', displayName: 'Address', cellTemplate: $templateCache.get("portalAddress.html") },
        { field: '$podsLink', displayName: 'Pods', cellTemplate: $templateCache.get("podCountsAndLinkTemplate.html") },
        { field: 'spec.selector', displayName: 'Selector', cellTemplate: $templateCache.get("selectorTemplate.html") },
        { field: 'labelsText', displayName: 'Labels', cellTemplate: $templateCache.get("labelTemplate.html") },
        { field: 'metadata.namespace', displayName: 'Namespace' }
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
