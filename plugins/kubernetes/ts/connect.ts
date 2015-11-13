/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  // controller for connecting to a remote container via jolokia
  export var ConnectController = controller("ConnectController", [
    "$scope", "localStorage", "userDetails", "ConnectDialogService", "$browser",
    ($scope, localStorage, userDetails, ConnectDialogService, $browser:ng.IBrowserService) => {

      $scope.doConnect = (entity) => {
        var connectUrl:any = new URI().path(UrlHelpers.join(HawtioCore.documentBase(), '/java/index.html'));
        var returnTo = new URI().toString();
        var title = entity.metadata.name || 'Untitled Container';
        var token = userDetails.token || '';
        connectUrl.hash(token).query({
          jolokiaUrl: entity.$jolokiaUrl,
          title: title,
          returnTo: returnTo
        });
        log.debug("Connect URI: ", connectUrl.toString());
        window.open(connectUrl.toString());
      };

    }]);
}
