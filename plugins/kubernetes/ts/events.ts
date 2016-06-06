/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var EventsController = controller("EventsController",
    ["$scope", "KubernetesModel", "KubernetesServices", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesServices:ng.resource.IResourceClass<any>, KubernetesPods:ng.resource.IResourceClass<any>, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;

    ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');

    $scope.tableConfig = {
      data: 'model.events',
      showSelectionCheckbox: false,
      enableRowClickSelection: false,
      selectedItems: [],
      filterOptions: {
        filterText: $location.search()["q"] || ''
      },
      sortInfo: {
        sortBy: '$firstTimestamp',
        ascending: false
      },
      columnDefs: [
        { field: 'involvedObject.kind',
          displayName: 'Kind',
          cellTemplate: $templateCache.get("eventKindTemplate.html")
        },
        { field: 'involvedObject.name',
          displayName: 'Name',
          cellTemplate: $templateCache.get("eventNameTemplate.html")
        },
        { field: 'message',
          displayName: 'Message'
        },
        { field: 'reason',
          displayName: 'Reason'
        },
        { field: 'count',
          displayName: 'Count'
        },
        { field: 'involvedObject.fieldPath',
          displayName: 'Subject'
        },
        { field: 'source',
          displayName: 'Source',
          cellTemplate: $templateCache.get("eventSourceTemplate.html")
        },
        { field: '$firstTimestamp',
          displayName: 'First Seen',
          cellTemplate: $templateCache.get("firstTimestampTemplate.html")
        },
        { field: '$lastTimestamp',
          displayName: 'Last Seen',
          cellTemplate: $templateCache.get("lastTimestampTemplate.html")
        },
      ]
    };

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
  }]);
}
