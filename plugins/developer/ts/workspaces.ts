/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var WorkspacesController = controller("WorkspacesController",
    ["$scope", "KubernetesModel", "KubernetesServices", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesServices:ng.resource.IResourceClass, KubernetesPods:ng.resource.IResourceClass, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;

        ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');

        var kubeClient = Kubernetes.createKubernetesClient("projects");

        $scope.developerPerspective = Core.trimLeading($location.url(), "/").startsWith("workspace");

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
              cellTemplate: $templateCache.get($scope.developerPerspective ? "viewNamespaceProjectsTemplate.html" : "viewNamespaceTemplate.html")
            },
            {
              field: 'metadata.description',
              displayName: 'Description'
            },
            {
              field: '$creationDate',
              displayName: 'Created',
              cellTemplate: $templateCache.get("creationTimeTemplate.html")
            },
            {
              field: '$labelsText',
              displayName: 'Labels',
              cellTemplate: $templateCache.get("labelTemplate.html")
            }
          ]
        };

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

        $scope.breadcrumbConfig = createWorkspacesBreadcrumbs($scope.developerPerspective);
        $scope.subTabConfig = Developer.createWorkspacesSubNavBars($scope.developerPerspective);

        $scope.$on('kubernetesModelUpdated', function () {
          updateData();
          Core.$apply($scope);
        });

        updateData();

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
             title: 'Delete Namespaces',
             action: 'The following Namespaces will be deleted:',
             okText: 'Delete',
             okClass: 'btn-danger',
             custom: "This operation is permanent once completed!",
             customClass: "alert alert-warning"
           }).open();
         };


        function updateData() {
          var projects = $scope.model.projects;
          if (projects) {
            $scope.model.workspaces = _.sortBy(enrichWorkspaces(projects), "$name");
            $scope.model.fetched = true;
          }
        }

      }]);
}
