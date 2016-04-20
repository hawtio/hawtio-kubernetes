/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var ProjectEnvironmentsController = controller("ProjectEnvironmentsController",
    ["$scope", "KubernetesModel", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "$element",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, $element) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;

        ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        $scope.breadcrumbConfig = createProjectBreadcrumbs();
        $scope.subTabConfig = Developer.createWorkspaceSubNavBars();

        $scope.entityChangedCache = {};
        $scope.envVersionsCache = {};
        $scope.envNSCaches = {};
        $scope.envVersions = {};
        $scope.environments = [];

        $scope.tableConfig = {
          data: 'model.environments',
          showSelectionCheckbox: true,
          enableRowClickSelection: true,
          multiSelect: true,
          selectedItems: [],
          filterOptions: {
            filterText: $location.search()["q"] || ''
          },
          columnDefs: [
            {
              field: 'name',
              displayName: 'Environment',
              cellTemplate: $templateCache.get("environmentNameTempalte.html")
            },
            {
              field: 'namespace',
              displayName: 'Namespace'
            },
            {
              field: 'clusterUrl',
              displayName: 'Cluster URL'
            }
          ]
        };

        $scope.$on('kubernetesModelUpdated', function () {
          updateData();
        });

        $scope.$on('$routeUpdate', ($event) => {
          updateData();
        });

        function updateData() {
          $scope.environments = $scope.model.environments;
          updateEnvironmentWatch();
          //updateTabs();
          $scope.model.fetched = true;
          Core.$apply($scope);
        }

        updateData();

        /**
         * We have updated the entity so lets make sure we are watching all the environments to find
         * the project versions for each namespace
         */
        function updateEnvironmentWatch() {
          var project = null;
          var projectNamespace = $scope.namespace || Kubernetes.currentKubernetesNamespace();
          angular.forEach($scope.environments, (env) => {
            var ns = env.namespace;
            var caches = $scope.envNSCaches[ns];
            if (!caches) {
              caches = {};
              $scope.envNSCaches[ns] = caches;
              loadProjectVersions($scope, $element, project, env, ns, $scope.envVersions, caches, projectNamespace);
            }
          });
        }

        function updateTabs() {
          $scope.subTabConfig = Developer.createProjectSubNavBars($scope.id, null, $scope);
        }

      }]);
}
