/// <reference path="../../includes.d.ts" />
/// <reference path="../../kubernetes/ts/kubernetesHelpers.d.ts" />
/// <reference path="../../kubernetes/ts/kubernetesInterfaces.d.ts" />
/// <reference path="../../kubernetes/ts/kubernetesModel.d.ts" />
/// <reference path="developerPlugin.d.ts" />
/// <reference path="developerEnrichers.d.ts" />
/// <reference path="developerHelpers.d.ts" />
/// <reference path="developerNavigation.d.ts" />
declare module Developer {
    function clickApprove(element: any, url: any): void;
    var JenkinsLogController: ng.IModule;
}
