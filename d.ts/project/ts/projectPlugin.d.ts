/// <reference path="../../includes.d.ts" />
/// <reference path="../../kubernetes/ts/kubernetesHelpers.d.ts" />
/// <reference path="projectHelpers.d.ts" />
declare module Project {
    var _module: ng.IModule;
    var controller: (name: string, inlineAnnotatedConstructor: any[]) => ng.IModule;
    var route: (templateName: string, reloadOnSearch?: boolean) => {
        templateUrl: string;
        reloadOnSearch: boolean;
    };
}
