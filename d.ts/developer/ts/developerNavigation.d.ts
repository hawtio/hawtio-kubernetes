/// <reference path="../../includes.d.ts" />
declare module Developer {
    type LabelResolver = () => string;
    interface BreadcrumbConfig {
        href?: string;
        label?: string | LabelResolver;
        title?: string;
        class?: string;
        isValid?: () => boolean;
        isActive?: (subTab, path) => boolean;
    }
    function workspaceLink(): string;
    function projectLink(projectId: any): string;
    function createWorkspacesBreadcrumbs(developPerspective?: any): BreadcrumbConfig[];
    function createWorkspacesSubNavBars(developPerspective: any): any;
    function createWorkspaceBreadcrumbs(children?: any, workspaceName?: any): any;
    function createEnvironmentBreadcrumbs($scope: any, $location: any, $routeParams: any): any;
    function createProjectBreadcrumbs(projectName?: any, children?: Array<BreadcrumbConfig>, workspaceName?: any): any;
    function createProjectSettingsBreadcrumbs(projectName: any, workspaceName?: any): any;
    function createWorkspaceSubNavBars(): any;
    function namespaceRuntimeLink(workspaceName?: any): string;
    /**
     * Creates a routing function that loads a template and inject the needed directives to properly
     * display/update the Developer module managed tabs and bread crumbs for when the route is active.
     *
     * Example Usage:
     *
     * var route = Developer.createTabRoutingFunction("/app/somedir");
     * $routeProvider.when('/profiles', route('view.html', false, [{
     *     label: "Profiles",
     *     title: "Browse the profiles of this project"
     *   }]
     * ));
     *
     * @param baseURL
     * @returns {function(string, boolean=, Array<Developer.BreadcrumbConfig>=): {template: string, reloadOnSearch: boolean, controller: string|string|(function(any, ng.route.IRouteParamsService): undefined)[]}}
     */
    function createTabRoutingFunction(baseURL: string): (templateName: string, reloadOnSearch?: boolean, children?: BreadcrumbConfig[]) => {
        template: string;
        reloadOnSearch: boolean;
        controller: (string | (($scope: any, $routeParams: ng.route.IRouteParamsService) => void))[];
    };
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
    function environmentsLink(workspaceName?: any): string;
    function environmentLink(workspaceName: any, environmentNamespace: any, path?: string, ignoreBlankProject?: boolean): string;
    var customProjectSubTabFactories: any[];
    function createJenkinsBreadcrumbs(projectName: any, jobId: any, buildId: any): any;
    function createJenkinsSubNavBars(projectName: any, jenkinsJobId: any, buildId: any, extraOption?: any): any;
    function createEnvironmentSubNavBars($scope: any, $location: any, $routeParams: any): any;
    function environmentInstanceLink(env: any, projectName?: any): string;
    function namespaceLink($scope: any, $routeParams: any, path?: any): string;
    function normalizeHref(href: string): string;
    function activateCurrent(navBarItems: any): any;
}
