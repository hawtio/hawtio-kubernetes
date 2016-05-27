/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="kubernetesModel.ts"/>
/// <reference path="utilHelpers.ts"/>

module Kubernetes {

  export var DeploymentsController = controller("DeploymentsController", ["$scope", "KubernetesModel", "KubernetesState", "ServiceRegistry", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
    ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesState, ServiceRegistry, $dialog, $window, $templateCache, $routeParams, $location:ng.ILocationService, localStorage, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    /*
    $scope.$on('kubernetesModelUpdated', function () {
      Core.$apply($scope);
    });
    */

    $scope.tableConfig = {
      data: 'model.allDeployments',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      filterOptions: {
        filterText: $location.search()["q"] || ''
      },
      columnDefs: [
        {
          field: '_key',
          displayName: 'Name',
          defaultSort: true,
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
        {
          field: '$labelsText',
          displayName: 'Labels',
          cellTemplate: $templateCache.get("labelTemplate.html")
        },
      ]
    };

    $scope.deletePrompt = (selected) => {
       UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
         collection: selected,
         index: 'metadata.name',
         onClose: (result:boolean) => {
           if (result) {
             function deleteSelected(selected:Array<any>, next:any) {
               if (next) {
                 log.debug("deleting: ", getName(next));
                 KubernetesAPI.del({
                   object: next,
                   success: (obj) => {
                     log.debug("deleted: ", getName(obj));
                     deleteSelected(selected, selected.shift());
                   },
                   error: (err) => {
                     log.debug("Error deleting: ", err);
                     deleteSelected(selected, selected.shift());
                   }
                 });
               }
             }
             deleteSelected(selected, selected.shift());
           }
         },
         title: 'Delete Deployments',
         action: 'The following Deployments will be deleted:',
         okText: 'Delete',
         okClass: 'btn-danger',
         custom: "This operation is permanent once completed!",
         customClass: "alert alert-warning"
       }).open();
     };

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
  }]);
}
