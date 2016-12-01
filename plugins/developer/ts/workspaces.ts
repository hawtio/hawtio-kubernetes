/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  import getKubernetesModel = Kubernetes.getKubernetesModel;
  _module.controller('Developer.RunCDPipelineController', ($scope, documentBase) => {
    var entity:any = $scope.$eval('entity');
    if (entity.error) {
      $scope.onFinish();
    }
    $scope.$runCDPipelineLink = UrlHelpers.join(documentBase, "kubernetes/namespace", entity.targetNS ,"templates?q=cd-pipeline&returnTo=" + URI.encode(UrlHelpers.join(documentBase, "workspaces", entity.targetNS)));

  });

  _module.controller('Developer.ApplyNamespaceAndConfigController', ($scope) => {
    var config:any = $scope.$eval('config');
    var entity:any = $scope.$eval('entity');
    if ($scope.error) {
      delete $scope.error;
    }
    $scope.wizard = config.self();
    $scope.namespaceCreated = false;
    $scope.configCreated = false;
    $scope.targetNS = undefined;
    function createConfig() {
      var configMap = {
        kind: 'ConfigMap',
        apiVersion: Kubernetes.defaultApiVersion,
        metadata: {
          namespace: $scope.targetNS,
          name: 'fabric8-environments',
          labels: {
            kind: 'environments',
            provider: 'fabric8.io'
          }
        }
      };
      KubernetesAPI.put({
        object: configMap,
        success: (data) => {
          $scope.configCreated = true;
          Core.$apply($scope);
        },
        error: (err) => {
          entity.error = $scope.error = err;
          Core.$apply($scope);
        }
      });
    }
    function createNamespace() {
      Kubernetes.createNamespace($scope.targetNS, undefined, (data) => {
        $scope.namespaceCreated = true;
        Core.$apply($scope);
        createConfig();
      }, (err) => {
        entity.error = $scope.error = err;
        Core.$apply($scope);
      });
    }
    switch (entity.creationMode) {
      case 'New Namespace':
        $scope.targetNS = entity.newNamespaceName;
        createNamespace();
        break;
      case 'Existing Namespace':
        $scope.targetNS = entity.existingNamespaceName;
        $scope.namespaceCreated = true;
        createConfig();
        break;
    }
    // remove any possibly previously set errors
    if (entity.error) {
      delete entity.error;
    }
    entity.targetNS = $scope.targetNS;
  });

  export var WorkspacesController = controller("WorkspacesController",
  ["$scope", "KubernetesModel", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "$element",
  ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState,
  $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, $element) => {

    $scope.kubernetes = KubernetesState;

    // Model that tracks namespaces and config maps and associates them to create Teams
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
      public get namespaceNames() {
        return _.map(this.namespaces, (workspace) => workspace.$name);
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

    // Model for tracking the create team wizard state
    class CreateTeamWizard {
      private _active = false;
      public static get NEW_NS() { return 'New Namespace'; }
      public static get EXISTING_NS() { return 'Existing Namespace'; }
      public formConfig = {
        self: undefined,
        wizard: {
          onFinish: () => {
            this._active = false;
            this.formEntity = {};
          },
          onCancel: () => {
            this._active = false;
            this.formEntity = {};
          },
          onChange: (current, index, pageIds) => {
            return null;
          },
          isDisabled: (form) => {
            var name = form.$name;
            switch (name) {
              case 'createOrSelectNamespace':
                switch (this.formEntity.creationMode) {
                  case CreateTeamWizard.NEW_NS:
                    return Core.isBlank(this.formEntity.newNamespaceName);
                  case CreateTeamWizard.EXISTING_NS:
                    return Core.isBlank(this.formEntity.existingNamespaceName);
                  default:
                    return true;
                }
              default:
                return form.$invalid;
            }
          },
          isBackDisabled: (form) => {
            var name = form.$name;
            console.log("Name: ", name)
            switch (name) {
              case 'creatingNamespaceAndApplyingConfiguration':
              case 'runCdPipeline': 
                return true;
              default:
                return false;
            }
          },
          pages: {
            'Create or Select Namespace': {
              controls: [
                'creationMode',
                'newNamespaceName',
                'existingNamespaceName'
                ]
            },
            'Creating Namespace and Applying Configuration': {
              controls: [
                'applyNamespaceAndConfig'
              ]
            },
            'Run CD Pipeline': {
              controls: [
                'runCDPipelinePrompt'
              ]
            }
          }
        },
        properties: {
          "creationMode": {
            label: "Create Using",
            enum: [CreateTeamWizard.NEW_NS, CreateTeamWizard.EXISTING_NS],
            type: 'string',
            'default': 'New Namespace'
          },
          "newNamespaceName": {
            label: "With Name",
            type: 'string',
            selectors: {
              'el': (group) => {
                group.attr({'ng-show': "entity.creationMode === '" + CreateTeamWizard.NEW_NS + "'"});
              }
            }
          },
          "existingNamespaceName": {
            getNames: () => model.namespaceNames,
            formTemplate: `
              <div ng-show="entity.creationMode === '` + CreateTeamWizard.EXISTING_NS + `'" class="form-group">

                <label class="col-sm-2 control-label"></label>
                <div class="col-sm-10">
                  <select class="form-control" ng-model="entity.existingNamespaceName" ng-options="label for label in config.properties.existingNamespaceName.getNames()"></select>
                </div>

              </div>
            `,
            selectors: {
              'el': (group) => {
                group.attr({'ng-show': "entity.creationMode === 'Existing Namespace'"});
              }
            }
          },
          "applyNamespaceAndConfig": {
            formTemplate: `
              <div ng-include="'applyNamespaceAndConfigTemplate.html'"></div>

            `
          },
          "runCDPipelinePrompt": {
            formTemplate: `
              <div ng-include="'runCDPipelineTemplate.html'"></div>
            `
          }
        }
      }
      public formEntity:any = {

      };
      constructor() {
        this.formConfig.self = () => this;
      }
      get active() {
        return this._active;
      }
      public start() {
        this._active = true;
      }
    }
    var wizard = $scope.wizard = new CreateTeamWizard();

    function updateEnvironmentsFromModel() {
      var environments = [];
      var configMapName = "fabric8-environments";
      var envConfigMap = Kubernetes.getKubernetesModel().getConfigMap(configMapName);
      if (angular.isObject(envConfigMap)) {
        environments.push(envConfigMap);
      }
      model.environments = environments;
      model.environmentsFetched = true;
      Core.$apply($scope);
    }

    $scope.$on("kubernetesModelUpdated", updateEnvironmentsFromModel);

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
              workspace.$runtimeLink = UrlHelpers.join("workspaces", team.metadata.name, "/namespace", workspace.metadata.name, "/apps");
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

    // now that we show Teams separately to this table, lets just link to the runtime perspective by default
    // for these namespaces
    $scope.developerPerspective = false;
    //$scope.developerPerspective = _.startsWith(Core.trimLeading($location.url(), "/"), "workspace");

    var tableConfig = {
      data: 'model.namespaces',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      primaryKeyFn: () => '$name',
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
        $scope.model.workspacesFetched = true;
        Core.$apply($scope);
      }
    });


    var ns = Kubernetes.currentKubernetesNamespace();
    log.info("watching ConfigMaps in namespace: " + ns);

    Kubernetes.watch($scope, $element, KubernetesAPI.WatchTypes.CONFIG_MAPS, undefined, (configmaps) => {
      var updated = false;
      if (configmaps && configmaps.length) {
        var environments = [];
        angular.forEach(configmaps, (configmap) => {
          var name = Kubernetes.getName(configmap);
          if (name === "fabric8-environments") {
            environments.push(configmap);
          }
        });
        if (environments.length) {
          $scope.model.environments = environments;
          $scope.model.environmentsFetched = true;
          updated = true;
          Core.$apply($scope);
        }
      }
      if (!updated) {
        updateEnvironmentsFromModel();
      }
    }, { 'kind': 'environments', 'provider': 'fabric8.io' });

    $scope.deletePrompt = (selected, kind = 'namespaces') => {
      if (angular.isString(selected)) {
        selected = [{
          metadata: {
            name: selected
          }
        }];
      }
      
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
        title: 'Delete ' + _.capitalize(kind),
        action: 'The following ' + kind + ' will be deleted:',
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

    $scope.createEnvironmentNamespace = (name) => {
      Kubernetes.createNamespace(name);
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
        createNamespaceDialog.newNamespaceName = "";
      },
      open: (controller) => {
        var createNamespaceDialog = $scope.createNamespaceDialog;
        createNamespaceDialog.dialog.open();

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
