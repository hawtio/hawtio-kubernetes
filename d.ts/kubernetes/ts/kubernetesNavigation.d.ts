/// <reference path="../../includes.d.ts" />
/// <reference path="kubernetesHelpers.d.ts" />
declare module Kubernetes {
    function selectSubNavBar($scope: any, tabName: any, newSubTabLabel: any): void;
    /**
     * Navigates to the given path. If the path starts with the HawtioCore.documentBase() then its stripped off the front
     * so that the navigation works properly on vanilla kubernetes
     */
    function goToPath($location: any, path: any): any;
}
