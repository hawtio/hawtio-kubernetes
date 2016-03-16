/// <reference path="../../includes.d.ts" />
/// <reference path="kubernetesHelpers.d.ts" />
/// <reference path="kubernetesPlugin.d.ts" />
/// <reference path="kubernetesModel.d.ts" />
declare var jsyaml: any;
declare module Kubernetes {
    var FileDropController: ng.IModule;
    var NamespaceController: ng.IModule;
    var TopLevel: ng.IModule;
}
