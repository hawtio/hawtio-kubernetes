/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  _module.directive("hawtioBreadcrumbs", ['HawtioBreadcrumbs', (HawtioBreadcrumbs) => {
    return {
      /*
      templateUrl: Kubernetes.templatePath + 'breadcrumbs.html'
      */
      link: (scope, element, attrs) => {
        HawtioBreadcrumbs.apply(scope.$eval('breadcrumbConfig'));
      }
    };
  }]);
}
