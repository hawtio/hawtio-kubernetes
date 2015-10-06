/// <reference path="../../includes.d.ts" />
declare module Developer {
    function createWorkspaceBreadcrumbs(children?: any, workspaceName?: any): any;
    function createEnvironmentBreadcrumbs($scope: any, $location: any, $routeParams: any): any;
    function createProjectBreadcrumbs(projectName?: any, children?: any, workspaceName?: any): any;
    function createWorkspaceSubNavBars(): any;
    function createProjectSubNavBars(projectName: any, jenkinsJobId?: any): any;
    function createEnvironmentSubNavBars($scope: any, $location: any, $routeParams: any): any;
}
