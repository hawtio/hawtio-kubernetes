/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  // controller for connecting to a remote container via jolokia
  export var ConnectController = controller("ConnectController", [
    "$scope", "localStorage", "userDetails", "ConnectDialogService",
    ($scope, localStorage, userDetails, ConnectDialogService) => {

      $scope.connect = ConnectDialogService;

      $scope.onOK = () => {
        var userName = $scope.connect.userName;
        var password = $scope.connect.password;
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
      };

      $scope.doConnect = (entity) => {
        if (userDetails) {
          $scope.connect.userName = userDetails.username;
          $scope.connect.password = userDetails.password;
        }
        $scope.connect.jolokiaUrl = entity.$jolokiaUrl;
        $scope.connect.containerName = entity.id;
        //$scope.connect.view = "#/openlogs";

        var alwaysPrompt = localStorage['fabricAlwaysPrompt'];
        if ((alwaysPrompt && alwaysPrompt !== "false") || !$scope.connect.userName || !$scope.connect.password) {
          $scope.connect.dialog.open();
        } else {
          $scope.connect.onOK();
        }
      };

    }]);
}