/// <reference path="../../includes.d.ts" />
declare module Developer {
    function workspaceLink(): string;
    function projectLink(projectId: any): string;
    function createWorkspacesBreadcrumbs(developPerspective: any): any[];
    function createWorkspacesSubNavBars(developPerspective: any): any;
    function createWorkspaceBreadcrumbs(children?: any, workspaceName?: any): any;
    function createEnvironmentBreadcrumbs($scope: any, $location: any, $routeParams: any): any;
    function createProjectBreadcrumbs(projectName?: any, children?: any, workspaceName?: any): any;
    function createProjectSettingsBreadcrumbs(projectName: any, workspaceName?: any): any;
    function createWorkspaceSubNavBars(): any;
    function createProjectSubNavBars(projectName: any, jenkinsJobId?: any, $scope?: any): any;
    function createProjectSettingsSubNavBars(projectName: any, jenkinsJobId?: any): any;
    function forgeProjectHasBuilder(name: any): any;
    function forgeProjectHasPerspective(name: any): any;
    function editPipelineLinkScope($scope: any): string;
    function createProjectLink(workspaceName?: any): string;
    function editPipelineLink(workspaceName: any, projectName: any): string;
    function editMavenBuildLink(workspaceName: any, projectName: any): string;
    function projectSecretsLink(workspaceName: any, projectName: any): string;
    function secretsNamespaceLink(workspaceName: any, projectName: any, secretsNamespace: any): string;
    function projectWorkspaceLink(workspaceName: any, projectName: any, path: any, ignoreBlankProject?: boolean): string;
    var customProjectSubTabFactories: any[];
    function createJenkinsBreadcrumbs(projectName: any, jobId: any, buildId: any): any;
    function createJenkinsSubNavBars(projectName: any, jenkinsJobId: any, buildId: any, extraOption?: any): any;
    function createEnvironmentSubNavBars($scope: any, $location: any, $routeParams: any): any;
    function namespaceLink($scope: any, $routeParams: any, path?: any): string;
}
