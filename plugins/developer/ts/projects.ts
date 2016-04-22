/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var AppsController = controller("AppsController", ["$scope", "KubernetesModel", "KubernetesState", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
    ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, $dialog, $window, $templateCache, $routeParams, $location:ng.ILocationService, localStorage, $http, $timeout, KubernetesApiURL) => {

      $scope.kubernetes = KubernetesState;
      $scope.model = KubernetesModel;

      $scope.tableConfig = {
        data: 'model.buildconfigs',
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
/*
          {
            field: 'spec.source.type',
            displayName: 'Source'
          },
*/
          {
            field: 'spec.source.git.uri',
            displayName: 'Repository'
          },
/*
          {
            field: 'spec.strategy.type',
            displayName: 'Strategy'
          },
          {
            field: 'spec.strategy.stiStrategy.image',
            displayName: 'Source Image'
          },
          {
            field: 'spec.output.imageTag',
            displayName: 'Output Image'
          },
*/
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

      $scope.breadcrumbConfig = createProjectBreadcrumbs();
      $scope.subTabConfig = Developer.createWorkspaceSubNavBars();

      // TODO
      //$scope.isLoggedIntoGogs = Forge.isLoggedIntoGogs;

      $scope.deletePrompt = (selected) => {
        UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
          collection: selected,
          index: '$name',
          onClose: (result:boolean) => {
            if (result) {
              function deleteSelected(selected, next) {
                if (next) {
                  deleteEntity(next, () => {
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
          title: 'Delete Apps',
          action: 'The following Apps will be deleted:',
          okText: 'Delete',
          okClass: 'btn-danger',
          custom: "This operation is permanent once completed!",
          customClass: "alert alert-warning"
        }).open();
      };

      function deleteEntity(selection, nextCallback) {
        var name = (selection || {}).$name;
        var jenkinsJob = selection.$jenkinsJob;
        var publicJenkinsUrl = jenkinsLink();
        //var jenkinsUrl = Core.pathGet(selection, ["$fabric8Views", "fabric8.link.jenkins.job", "url"]);
        if (name) {
          console.log("About to delete build config: " + name);
          var url = Kubernetes.buildConfigRestUrl(name);
          $http.delete(url).
            success(function (data, status, headers, config) {
              nextCallback();
            }).
            error(function (data, status, headers, config) {
              log.warn("Failed to delete build config on " + url + " " + data + " " + status);
              nextCallback();
            });
        } else {
          console.log("warning: no name for selection: " + angular.toJson(selection));
        }

        if (jenkinsJob && publicJenkinsUrl) {
          var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(jenkinsServiceNameAndPort, UrlHelpers.join("job", jenkinsJob, "doDelete"));
          var body = "";
          var config = {
            headers: {
              'Content-Type': "text/plain"
            }
          };
          log.info("posting to jenkinsUrl: " + url);
          $http.post(url, body, config).
            success(function (data, status, headers, config) {
              log.info("Managed to delete " + url);
            }).
            error(function (data, status, headers, config) {
              log.warn("Failed to delete jenkins job at " + url + " " + data + " " + status);
            });
        }
      }

/*
      $scope.$keepPolling = () => Kubernetes.keepPollingModel;
      $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
        var url = Kubernetes.buildConfigsRestURL();
        $http.get(url).
          success(function (data, status, headers, config) {
            if (data) {
              //console.log("got data " + angular.toJson(data, true));
              var sortedBuilds = null;
              $scope.buildConfigs = Kubernetes.enrichBuildConfigs(data.items, sortedBuilds);
              $scope.model.fetched = true;
              Core.$apply($scope);
              next();
            }
          }).
          error(function (data, status, headers, config) {
            log.warn("Failed to load " + url + " " + data + " " + status);
            next();
          });
      });

      $scope.fetch();
*/
    }]);
}
