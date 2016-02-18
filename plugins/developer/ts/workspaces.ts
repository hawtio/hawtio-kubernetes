/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var WorkspacesController = controller("WorkspacesController",
    ["$scope", "KubernetesModel", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;

        ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');

        var kubeClient = Kubernetes.isOpenShift ? Kubernetes.createKubernetesClient("projects") : Kubernetes.createKubernetesClient('namespaces');
        kubeClient.watch((objects) => {
          if (objects) {
            $scope.model.workspaces = _.sortBy(enrichWorkspaces(objects), "$name");
            $scope.model.fetched = true;
          }
        });

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
        $scope.subTabConfig = []; //Developer.createWorkspacesSubNavBars($scope.developerPerspective);

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
             title: 'Delete Projects',
             action: 'The following projects will be deleted:',
             okText: 'Delete',
             okClass: 'btn-danger',
             custom: "This operation is permanent once completed!",
             customClass: "alert alert-warning"
           }).open();
         };

        $scope.checkNamespaceUnique = (value) => {
          var answer = true;
          angular.forEach($scope.model.workspaces, (secret) => {
            var name = Kubernetes.getName(secret);
            if (value === name) {
              answer = false;
            }
          });
          return answer;
        };

        $scope.createNamespaceDialog = {
          controller: null,
          newNamespaceName: "",
          dialog: new UI.Dialog(),
          onOk: () => {
            var createNamespaceDialog = $scope.createNamespaceDialog;
            createNamespaceDialog.dialog.close();

            var name = createNamespaceDialog.newNamespaceName;
            Kubernetes.createNamespace(name, kubeClient);
          },
          open: (controller) => {
            var createNamespaceDialog = $scope.createNamespaceDialog;
            createNamespaceDialog.dialog.open();
            createNamespaceDialog.newNamespaceName = "";

            $timeout(() => {
              $('#newDataName').focus();
            }, 50);
          },
          close: () => {
            $scope.createNamespaceDialog.dialog.close();
          }
        };

      }]);
}
