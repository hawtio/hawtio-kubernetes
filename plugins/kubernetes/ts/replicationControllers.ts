/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var ReplicationControllers = controller("ReplicationControllers",
    ["$scope", "KubernetesModel", "KubernetesReplicationControllers", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "jolokia", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesReplicationControllers:ng.IPromise<ng.resource.IResourceClass>, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, jolokia:Jolokia.IJolokia, $http, $timeout, KubernetesApiURL) => {

    $scope.namespace = $routeParams.namespace;
    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    $scope.$on('kubernetesModelUpdated', function () {
      Core.$apply($scope);
    });

    $scope.replicationControllers = [];
    $scope.allReplicationControllers = [];
    var pods = [];
    $scope.fetched = false;
    $scope.json = '';
    ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);

    $scope.detailConfig = {
      properties: {
        '^\\/labels$': {
          template: $templateCache.get('labelTemplate.html')
        }
      }
    };

    $scope.tableConfig = {
      data: 'model.replicationControllers',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      filterOptions: {
        filterText: $location.search()["q"] || ''
      },
      columnDefs: [
        { field: 'id', displayName: 'ID', cellTemplate: $templateCache.get("idTemplate.html") },
        { field: 'currentState.replicas', displayName: 'Pods', cellTemplate: $templateCache.get("podCountsAndLinkTemplate.html") },
        { field: 'desiredState.replicas', displayName: 'Replicas', cellTemplate:$templateCache.get("desiredReplicas.html") },
        { field: 'labelsText', displayName: 'Labels', cellTemplate: $templateCache.get("labelTemplate.html") },
        { field: 'namespace', displayName: 'Namespace' }
      ]
    };

    Kubernetes.initShared($scope, $location, $http, $timeout, KubernetesApiURL);


    $scope.$on('kubeSelectedId', ($event, id) => {
      Kubernetes.setJson($scope, id, $scope.replicationControllers);
    });

    $scope.$on('$routeUpdate', ($event) => {
      Kubernetes.setJson($scope, $location.search()['_id'], $scope.pods);
    });

    KubernetesReplicationControllers.then((KubernetesReplicationControllers:ng.resource.IResourceClass) => {
      KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {
        $scope.deletePrompt = (selected) => {
          if (angular.isString(selected)) {
            selected = [{
              id: selected
            }];
          }
          UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
            collection: selected,
            index: 'id',
            onClose: (result:boolean) => {
              if (result) {
                function deleteSelected(selected:Array<KubePod>, next:KubePod) {
                  if (!next) {
                    if (!jolokia.isRunning()) {
                      $scope.fetch();
                    }
                  } else {
                    log.debug("deleting: ", next.id);
                    KubernetesReplicationControllers.delete({
                      id: next.id
                    }, undefined, () => {
                      log.debug("deleted: ", next.id);
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
            title: 'Delete replication controllers?',
            action: 'The following replication controllers will be deleted:',
            okText: 'Delete',
            okClass: 'btn-danger',
            custom: "This operation is permanent once completed!",
            customClass: "alert alert-warning"
          }).open();
        };

/*        $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
          var ready = 0;
          var numServices = 2;

          function maybeNext(count) {
            ready = count;
            // log.debug("Completed: ", ready);
            if (ready >= numServices) {
              // log.debug("Fetching another round");
              maybeInit();
              next();
            }
          }

          KubernetesReplicationControllers.query((response) => {
            //log.debug("got back response: ", response);
            $scope.fetched = true;
            if ($scope.anyDirty()) {
              log.debug("Table has been changed, not updating local view");
              next();
              return;
            }
            $scope.allReplicationControllers = (response['items'] || []).sortBy((item) => {
              return item.id;
            });
            $scope.replicationControllers = $scope.allReplicationControllers.filter((item) => {
              return !$scope.kubernetes.selectedNamespace || $scope.kubernetes.selectedNamespace === item.namespace
            });
            angular.forEach($scope.replicationControllers, entity => {
              entity.$labelsText = Kubernetes.labelsToString(entity.labels);
              var desiredState = entity.desiredState || {};
              var replicaSelector = desiredState.replicaSelector;
              if (replicaSelector) {
                entity.podsLink = Core.url("/kubernetes/pods?q=" +
                encodeURIComponent(Kubernetes.labelsToString(replicaSelector, " ")));
              }
            });
            Kubernetes.setJson($scope, $scope.id, $scope.replicationControllers);
            updatePodCounts();
            maybeNext(ready + 1);
          });

          KubernetesPods.query((response) => {
            ArrayHelpers.sync(pods, (response['items'] || []).filter((pod:KubePod) => {
              return pod.id && (!$scope.namespace || $scope.namespace === pod.namespace)
            }));
            updatePodCounts();
            maybeNext(ready + 1);
          });
        });
        $scope.fetch();
        */
      });
    });

    function maybeInit() {
    }
  }]);
}
