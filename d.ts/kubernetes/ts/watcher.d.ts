/// <reference path="kubernetesPlugin.d.ts" />
declare module Kubernetes {
    var watches: any;
    function getWSUrl(watchUrl: any, userDetails: any): any;
}
