/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  _module.directive("hawtioBreadcrumbs", () => {
    return {
      templateUrl: Kubernetes.templatePath + 'breadcrumbs.html'
    };
  });
}
