/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var HostsController = controller("HostsController", ["$scope", "KubernetesModel", "KubernetesPods", "KubernetesState", "ServiceRegistry", "$dialog", "$window", "$templateCache", "$routeParams", "$location", "localStorage", "$http", "$timeout", "KubernetesApiURL",
    ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, KubernetesState, ServiceRegistry, $dialog, $window, $templateCache, $routeParams, $location:ng.ILocationService, localStorage, $http, $timeout, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    $scope.$on('kubernetesModelUpdated', function () {
      Core.$apply($scope);
    });

    $scope.tableConfig = {
      data: 'model.hosts',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      filterOptions: {
        filterText: $location.search()["q"] || ''
      },
      columnDefs: [
        {
          field: 'id',
          displayName: 'Name',
          defaultSort: true,
          cellTemplate: $templateCache.get("idTemplate.html")
        },
        {
          field: 'hostIP',
          displayName: 'IP'
        },
        { field: '$podsLink',
          displayName: 'Pods',
          cellTemplate: $templateCache.get("podCountsAndLinkTemplate.html")
        }
      ]
    };

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    $scope.connect = {
      dialog: new UI.Dialog(),
      saveCredentials: false,
      userName: null,
      password: null,
      jolokiaUrl: null,
      containerName: null,
      view: null,

      onOK: () => {
        var userName = $scope.connect.userName;
        var password = $scope.connect.password;
        var userDetails = <Core.UserDetails> HawtioCore.injector.get('userDetails');
        if (!userDetails.password) {
          // this can get unset if the user happens to refresh and hasn't checked rememberMe
          userDetails.password = password;
        }
        if ($scope.connect.saveCredentials) {
          $scope.connect.saveCredentials = false;
          if (userName) {
            localStorage['kuberentes.userName'] = userName;
          }
          if (password) {
            localStorage['kuberentes.password'] = password;
          }
        }
        log.info("Connecting to " + $scope.connect.jolokiaUrl + " for container: " + $scope.connect.containerName + " user: " + $scope.connect.userName);
        var options = Core.createConnectOptions({
          jolokiaUrl: $scope.connect.jolokiaUrl,
          userName: userName,
          password: password,
          useProxy: true,
          view: $scope.connect.view,
          name: $scope.connect.containerName
        });
        Core.connectToServer(localStorage, options);
        setTimeout(() => {
          $scope.connect.dialog.close();
          Core.$apply($scope);
        }, 100);
      },

      doConnect: (entity) => {
        var userDetails = <Core.UserDetails> HawtioCore.injector.get('userDetails');
        if (userDetails) {
          $scope.connect.userName = userDetails.username;
          $scope.connect.password = userDetails.password;
        }
        $scope.connect.jolokiaUrl =  entity.$jolokiaUrl;
        $scope.connect.containerName = entity.id;
        //$scope.connect.view = "#/openlogs";

        var alwaysPrompt = localStorage['fabricAlwaysPrompt'];
        if ((alwaysPrompt && alwaysPrompt !== "false") || !$scope.connect.userName || !$scope.connect.password) {
          $scope.connect.dialog.open();
        } else {
          $scope.connect.onOK();
        }
      }
    };

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
                if (next) {
                  log.debug("deleting: ", next.id);
                  KubernetesPods.delete({
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
          title: 'Delete pods?',
          action: 'The following pods will be deleted:',
          okText: 'Delete',
          okClass: 'btn-danger',
          custom: "This operation is permanent once completed!",
          customClass: "alert alert-warning"
        }).open();
      };
    });
  }]);
}
