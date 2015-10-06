/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var EventsController = controller("WorkspacesController",
    ["$scope", "KubernetesModel", "KubernetesServices", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "jolokia", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesServices:ng.resource.IResourceClass, KubernetesPods:ng.resource.IResourceClass, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, jolokia:Jolokia.IJolokia, $http, $timeout, KubernetesApiURL) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;

        ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');

        $scope.tableConfig = {
          data: 'model.workspaces',
          showSelectionCheckbox: true,
          enableRowClickSelection: false,
          multiSelect: true,
          selectedItems: [],
          filterOptions: {
            filterText: $location.search()["q"] || ''
          },
          columnDefs: [
            {
              field: '$name',
              displayName: 'Name',
              cellTemplate: $templateCache.get("idTemplate.html")
            },
            {
              field: 'metadata.description',
              displayName: 'Description'
            },
            {
              field: '$labelsText',
              displayName: 'Labels',
              cellTemplate: $templateCache.get("labelTemplate.html")
            }
          ]
        };

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

        $scope.$keepPolling = () => Kubernetes.keepPollingModel;
        $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
          var url = Kubernetes.resourcesUriForKind("Projects");
          $http.get(url).
            success(function (data, status, headers, config) {
              if (data) {
                $scope.model.workspaces = enrichWorkspaces(data.items);
                $scope.fetched = true;
              }
              Core.$apply($scope);
              next();
            }).
            error(function (data, status, headers, config) {
              log.warn("Failed to load " + url + " " + data + " " + status);
              Core.$apply($scope);
              next();
            });
        });

        $scope.fetch();

      }]);
}
