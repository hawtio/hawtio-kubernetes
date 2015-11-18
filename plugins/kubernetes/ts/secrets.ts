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

    $scope.tableConfig = {
      data: 'model.secrets',
      showSelectionCheckbox: false,
      enableRowClickSelection: false,
      multiSelect: false,
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

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
  }]);
}
