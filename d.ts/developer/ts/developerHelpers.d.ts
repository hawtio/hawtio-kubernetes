/// <reference path="../../includes.d.ts" />
declare module Developer {
    var context: string;
    var hash: string;
    var pluginName: string;
    var pluginPath: string;
    var templatePath: string;
    var log: Logging.Logger;
    var jenkinsServiceName: string;
    /**
     * Returns true if the value hasn't changed from the last cached JSON version of this object
     */
    function hasObjectChanged(value: any, state: any): boolean;
    function enrichWorkspaces(projects: any): any;
    function enrichWorkspace(build: any): any;
    function enrichJenkinsJob(job: any): any;
    function enrichJenkinsBuild(build: any): void;
    function createWorkspaceBreadcrumbs(children?: any, workspaceName?: any): any;
    function createEnvironmentBreadcrumbs($scope: any, $location: any, $routeParams: any): any;
    function createProjectBreadcrumbs(projectName?: any, children?: any, workspaceName?: any): any;
    function createWorkspaceSubNavBars(): any;
    function createProjectSubNavBars(projectName: any): any;
    function createEnvironmentSubNavBars($scope: any, $location: any, $routeParams: any): any;
    /**
     * Lets load the project versions for the given namespace
     */
    function loadProjectVersions($scope: any, $http: any, project: any, env: any, ns: any): void;
}
