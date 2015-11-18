/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="kubernetesModel.ts"/>
/// <reference path="utilHelpers.ts"/>

module Kubernetes {

  export var SecretsController = controller("SecretsController", ["$scope", "KubernetesModel", "KubernetesPods", "KubernetesState", "ServiceRegistry", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
    ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, KubernetesState, ServiceRegistry, $dialog, $window, $templateCache, $routeParams, $location:ng.ILocationService, localStorage, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    $scope.$on('kubernetesModelUpdated', function () {
      Core.$apply($scope);
    });

    $scope.$createSecretLink = Developer.namespaceLink($scope, $routeParams, "secretCreate");

    var kubeClient = createKubernetesClient("secrets");

    $scope.tableConfig = {
      data: 'model.secrets',
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
             function deleteSelected(selected, next) {
               if (next) {
                 kubeClient.delete(next, () => {
                   deleteSelected(selected, selected.shift());
                 });
               } else {
                 // TODO
                 // updateData();
               }
             }

             deleteSelected(selected, selected.shift());
           }
         },
         title: 'Delete Secrets',
         action: 'The following Secrets will be deleted:',
         okText: 'Delete',
         okClass: 'btn-danger',
         custom: "This operation is permanent once completed!",
         customClass: "alert alert-warning"
       }).open();
     };

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
  }]);
}
