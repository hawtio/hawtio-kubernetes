/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  _module.directive("hawtioTabs", () => {
    return {
      templateUrl: Kubernetes.templatePath + 'tabs.html'
    };
  });
}
