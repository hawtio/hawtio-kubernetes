/// <reference path="../../includes.d.ts" />
declare module Developer {
    var context: string;
    var hash: string;
    var pluginName: string;
    var pluginPath: string;
    var templatePath: string;
    var log: Logging.Logger;
    function enrichWorkspaces(projects: any): any;
    function enrichWorkspace(build: any): any;
    function createWorkspaceBreadcrumbs(children?: any): any;
    function createEnvironmentBreadcrumbs($scope: any, $location: any, $routeParams: any): any;
    function createProjectBreadcrumbs(projectName?: any, children?: any): any;
    function createWorkspaceSubNavBars(): any;
    function createProjectSubNavBars(projectName: any): any;
    function createEnvironmentSubNavBars($scope: any, $location: any, $routeParams: any): any;
}
