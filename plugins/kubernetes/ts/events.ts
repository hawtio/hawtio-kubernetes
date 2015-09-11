/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var EventsController = controller("EventsController",
    ["$scope", "KubernetesModel", "KubernetesServices", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "jolokia", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesServices:ng.resource.IResourceClass, KubernetesPods:ng.resource.IResourceClass, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, jolokia:Jolokia.IJolokia, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;

    ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');

    $scope.tableConfig = {
      data: 'model.events',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      filterOptions: {
        filterText: $location.search()["q"] || ''
      },
      columnDefs: [
        { field: '$first',
          displayName: 'First Seen',
          cellTemplate: $templateCache.get("firstTimestampTemplate.html")
        },
        { field: '$last',
          displayName: 'Last Seen',
          cellTemplate: $templateCache.get("lastTimestampTemplate.html")
        },
        { field: 'count',
          displayName: 'Count'
        },
        { field: 'involvedObject.name',
          displayName: 'Name'
        },
        { field: 'involvedObject.kind',
          displayName: 'Kind'
        },
        { field: 'involvedObject.fieldPath',
          displayName: 'Subject'
        },
        { field: 'reason',
          displayName: 'Reason'
        },
        { field: 'source',
          displayName: 'Subject'
        },
        { field: 'message',
          displayName: 'Message'
        }
      ]
    };

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
  }]);
}
