/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  // controller for connecting to a remote container via jolokia
  export var ConnectController = controller("ConnectController", [
    "$scope", "localStorage", "userDetails", "ConnectDialogService", "$browser",
    ($scope, localStorage, userDetails, ConnectDialogService, $browser:ng.IBrowserService) => {

      var base:any = document.querySelector('base');
      var baseHref = base && base.href || '';

      $scope.doConnect = (entity) => {
        var connectUrl:any = new URI(baseHref);
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
