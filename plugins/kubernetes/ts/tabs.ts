/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  _module.directive("hawtioTabs", ['HawtioSubTabs', (HawtioSubTabs) => {
    return {
      link: (scope, element, attrs) => {
        HawtioSubTabs.apply(scope.$eval('subTabConfig'));
      }
    };
  }]);
}
