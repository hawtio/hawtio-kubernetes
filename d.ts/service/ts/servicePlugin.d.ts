/// <reference path="serviceHelpers.d.ts" />
/// <reference path="../../includes.d.ts" />
declare module Service {
    interface SelectorMap {
        [name: string]: string;
    }
    interface Service {
        kind: string;
        id: string;
        portalIP: string;
        selector?: SelectorMap;
        port: number;
        containerPort: number;
    }
    interface ServiceResponse {
        items: Array<Service>;
    }
    var _module: ng.IModule;
}
