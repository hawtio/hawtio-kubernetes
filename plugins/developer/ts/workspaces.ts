/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var WorkspacesController = controller("WorkspacesController",
  ["$scope", "KubernetesModel", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "$element",
  ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState,
  $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, $element) => {

    $scope.kubernetes = KubernetesState;

    class Model {
      public workspaces = [];
      public namespaces = [];
      public environments = [];
      public teams = [];
      public updateCounter = 0;
      private _workspacesFetched = false;
      private _environmentsFetched = false;
      get fetched() {
        return this.workspacesFetched && this.environmentsFetched;
      }
      public get workspacesFetched():boolean {
        return this._workspacesFetched;
      }
      public get environmentsFetched():boolean {
        return this._environmentsFetched;
      }
      public set workspacesFetched(val:boolean) {
        this.updateCounter = this.updateCounter + 1;
        this._workspacesFetched = val;
      }
      public set environmentsFetched(val:boolean) {
        this.updateCounter = this.updateCounter + 1;
        this._environmentsFetched = val;
      }
    }

    var model = $scope.model = new Model();

    $scope.$watch('model.updateCounter', () => {
      if (model.fetched) {
        model.teams = [];
        model.namespaces = [];
        _.forEach(model.environments, (environment) => {
          var team = {
            metadata: {
              name: environment.metadata.namespace
            },
            environments: [<any>{
              order: -1,
              namespace: environment.metadata.namespace,
              kind: "development",
              name: "Development"
            }]
          };
          _.forOwn(environment.data, (config, kind) => {
            try {
              config = jsyaml.safeLoad(config);
              config.kind = kind;
              log.debug("Kind: ", kind, " config: ", config);
              team.environments.push(config);
            } catch (err) {
              log.debug("Failed to decode yaml: ", err);
            }
          });
          _.forEach(team.environments, (config) => {
            var workspace = _.find(model.workspaces, (workspace) => {
               return workspace.metadata.name === config.namespace;
            });
            if (workspace) {
              workspace.$inTeam = true;
              config.workspace = workspace;
            }
          });
          model.teams.push(team);
        });
        // Pull workspaces that are part of a team out
        model.namespaces = _.filter(model.workspaces, (workspace) => !workspace.$inTeam);
        if (!$scope.tableConfig) {
          $scope.tableConfig = tableConfig;
        }
      }
    });

    ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');

    $scope.developerPerspective = _.startsWith(Core.trimLeading($location.url(), "/"), "workspace");

    var tableConfig = {
      data: 'model.namespaces',
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

    Kubernetes.watch($scope, $element, Kubernetes.getNamespaceKind(), undefined, (objects) => {
      if (objects) {
        $scope.model.workspaces = _.sortBy(enrichWorkspaces(objects), "$name");
        console.log("\n\nGot workspaces: ", $scope.model.workspaces);
        $scope.model.workspacesFetched = true;
        Core.$apply($scope);
      }
    });

    Kubernetes.watch($scope, $element, KubernetesAPI.WatchTypes.CONFIG_MAPS, undefined, (configmaps) => {
      if (configmaps) {
        $scope.model.environments = configmaps;
        $scope.model.environmentsFetched = true;
        Core.$apply($scope);
      }
    }, { 'kind': 'environments', 'provider': 'fabric8.io' });

    $scope.deletePrompt = (selected) => {
      UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
        collection: selected,
        index: 'metadata.name',
        onClose: (result:boolean) => {
          if (!result) {
            return;
          }
          function deleteSelected(selected, next) {
            if (!next) {
              Core.$apply($scope);
              return;
            }
            Kubernetes.deleteNamespace(next, undefined, (data) => {
              deleteSelected(selected, selected.shift());
            }, (err) => {
              deleteSelected(selected, selected.shift());
            });
          }
          deleteSelected(selected, selected.shift());
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
        Kubernetes.createNamespace(name);
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
