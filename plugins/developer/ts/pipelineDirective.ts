/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {
  _module.directive("pipelineView", () => {
    return {
      templateUrl: templatePath + 'pipelineView.html'
    };
  });
}
