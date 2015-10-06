/// <reference path="../../includes.ts"/>
/// <reference path="developerHelpers.ts"/>

module Developer {

  export var _module = angular.module(pluginName, ['hawtio-core', 'hawtio-ui', 'wiki', 'restmod', 'ui.codemirror']);
  export var controller = PluginHelpers.createControllerFunction(_module, pluginName);
  export var route = PluginHelpers.createRoutingFunction(templatePath);

  _module.config(['$routeProvider', ($routeProvider:ng.route.IRouteProvider) => {
    $routeProvider.when(context, route('workspaces.html', false))
                  .when(UrlHelpers.join(context, '/:namespace'), route('projects.html', false))
                  .when(UrlHelpers.join(context, '/:namespace/detail'), route('workspace.html', false))
                  .when(UrlHelpers.join(context, '/:namespace/jenkinsJob'), route('jenkinsJobs.html', false))
                  .when(UrlHelpers.join(context, '/:namespace/projects'), route('projects.html', false))
                  .when(UrlHelpers.join(context, '/:namespace/projects/:id'), route('environments.html', false))
                  .when(UrlHelpers.join(context, '/:namespace/projects/:id/detail'), Kubernetes.route('buildConfig.html', false))
                  .when(UrlHelpers.join(context, '/:namespace/projects/:id/builds'), Kubernetes.route('builds.html', false))
                  .when(UrlHelpers.join(context, '/:namespace/projects/:id/environments'), route('environments.html', false))
                  .when(UrlHelpers.join(context, '/:namespace/projects/:id/jenkinsJob/:job'), route('jenkinsJob.html', false))
                  .when(UrlHelpers.join(context, '/:namespace/projects/:id/jenkinsJob/:job/pipelines'), route('pipelines.html', false))
                  .when(UrlHelpers.join(context, '/:namespace/projects/:id/jenkinsJob/:job/pipeline/:build'), route('pipeline.html', false))
                  .when(UrlHelpers.join(context, '/:namespace/projects/:id/tools'), route('tools.html', false))
                  .when(UrlHelpers.join(context, '/:workspace/projects/:project/environments/:namespace'), route('environment.html', false))
  }]);
  

  _module.run(['viewRegistry', 'workspace', 'ServiceRegistry', 'HawtioNav', 'KubernetesModel', '$templateCache', (viewRegistry, workspace:Core.Workspace, ServiceRegistry, HawtioNav, KubernetesModel, $templateCache) => {
    log.debug("Running");
    viewRegistry['workspaces'] = Kubernetes.templatePath + 'layoutKubernetes.html';

    var builder = HawtioNav.builder();
    var workspaces = builder.id('workspaces')
                      .href(() => context)
                      .title(() => 'All')
                      .build();

    var workspaceOverview = builder.id('workspaces')
                      .href(() => UrlHelpers.join(context, 'overview'))
                      .title(() => 'Workspace')
                      .build();

    var workspacesTab = builder.id('workspaces')
                         .rank(100)
                         .href(() => context)
                         .title(() => 'Workspaces')
                         .isValid(() => !Core.isRemoteConnection())
                         .tabs(workspaces)
                         .build();

    HawtioNav.add(workspacesTab);
  }]);


  hawtioPluginLoader.addModule(pluginName);
}
