/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="kubernetesModel.ts"/>
/// <reference path="utilHelpers.ts"/>

module Kubernetes {

  export var HostsController = controller("HostsController", ["$scope", "KubernetesModel", "KubernetesPods", "KubernetesState", "ServiceRegistry", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
    ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, KubernetesState, ServiceRegistry, $dialog, $window, $templateCache, $routeParams, $location:ng.ILocationService, localStorage, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    $scope.$on('kubernetesModelUpdated', function () {
      Core.$apply($scope);
    });

    $scope.tableConfig = {
      data: 'model.hosts',
      showSelectionCheckbox: false,
      enableRowClickSelection: false,
      multiSelect: false,
      selectedItems: [],
      filterOptions: {
        filterText: $location.search()["q"] || ''
      },
      columnDefs: [
        {
          field: 'id',
          displayName: 'Name',
          defaultSort: true,
          cellTemplate: $templateCache.get("idTemplate.html")
        },
        {
          field: 'hostIP',
          displayName: 'IP',
          customSortField: (field) => {
            // use a custom sort to sort ip address
            return Kubernetes.sortByPodIp(field.hostIP);
          }
        },
        { field: '$podsLink',
          displayName: 'Pods',
          cellTemplate: $templateCache.get("podCountsAndLinkTemplate.html"),
          customSortField: (field) => {
            // need to concat all the pod counters
            var valid = field.$podCounters.valid || 0;
            var waiting = field.$podCounters.waiting || 0;
            var error = field.$podCounters.error || 0;
            return valid + waiting + error;
          }
        }
      ]
    };

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
  }]);
}
