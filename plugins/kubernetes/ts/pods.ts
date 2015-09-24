/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="utilHelpers.ts"/>

module Kubernetes {

  export var EnvItem = controller("EnvItem", ["$scope", ($scope) => {
    var parts = $scope.data.split('=');
    $scope.key = parts.shift();
    $scope.value = parts.join('=');
  }]);

  // main controller for the page
  export var Pods = controller("Pods", ["$scope", "KubernetesModel", "KubernetesPods", "KubernetesState", "ServiceRegistry", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
    ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesPods:ng.resource.IResourceClass, KubernetesState, ServiceRegistry, $dialog, $window, $templateCache, $routeParams, $location:ng.ILocationService, localStorage, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    $scope.$on('kubernetesModelUpdated', function () {
      Core.$apply($scope);
    });

    $scope.itemSchema = Forms.createFormConfiguration();

    $scope.tableConfig = {
      data: 'model.pods',
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
          field: '$statusCss',
          displayName: 'Status',
          cellTemplate: $templateCache.get("statusTemplate.html")
        },
        { field: '$eventCount',
          displayName: 'Events',
          cellTemplate: $templateCache.get("eventSummaryTemplate.html")
        },
        {
          field: '$restartCount',
          displayName: 'Restarts'
        },
        {
          field: '$createdTime',
          displayName: 'Age',
          cellTemplate: $templateCache.get("ageTemplate.html")
        },
        {
          field: '$imageNames',
          displayName: 'Images',
          cellTemplate: $templateCache.get("imageTemplate.html")
        },
        {
          field: '$host',
          displayName: 'Host',
          cellTemplate: $templateCache.get("hostTemplate.html")
        },
        {
          field: '$labelsText',
          displayName: 'Labels',
          cellTemplate: $templateCache.get("labelTemplate.html")
        },
        {
          field: '$podIP',
          displayName: 'Pod IP',
          customSortField: (field) => {
            // use a custom sort to sort ip address
            return Kubernetes.sortByPodIp(field.$podIP);
          }
        }
      ]
    };

    $scope.openLogs = () => {
      var pods = $scope.tableConfig.selectedItems;
      if (!pods || !pods.length) {
        if ($scope.id) {
          var item = $scope.item;
          if (item) {
            pods = [item];
          }
        }
      }
      openLogsForPods(ServiceRegistry, $window, KubernetesModel.currentNamespace(), pods);
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
                KubernetesPods.delete({
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
        title: 'Delete pods?',
        action: 'The following pods will be deleted:',
        okText: 'Delete',
        okClass: 'btn-danger',
        custom: "This operation is permanent once completed!",
        customClass: "alert alert-warning"
      }).open();
    };
  }]);
}
