/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>

declare var OSOAuthConfig:any;
declare var GoogleOAuthConfig:any;
declare var KeycloakConfig:any;

module Kubernetes {

  export var _module = angular.module(pluginName, ['hawtio-core', 'hawtio-ui', 'ui.codemirror', 'ui.validate','kubernetesUI']);
  export var controller = PluginHelpers.createControllerFunction(_module, pluginName);
  export var route = PluginHelpers.createRoutingFunction(templatePath);

  _module.config(['$routeProvider', ($routeProvider:ng.route.IRouteProvider) => {

    $routeProvider
      .when(UrlHelpers.join(context, '/pods'), route('pods.html', false))
      .when(UrlHelpers.join(context, 'replicationControllers'), route('replicationControllers.html', false))
      .when(UrlHelpers.join(context, 'services'), route('services.html', false))
      .when(UrlHelpers.join(context, 'events'), route('events.html', false))
      .when(UrlHelpers.join(context, 'apps'), route('apps.html', false))
      .when(UrlHelpers.join(context, 'apps/:namespace'), route('apps.html', false))
      .when(UrlHelpers.join(context, 'hosts'), route('hosts.html', false))
      .when(UrlHelpers.join(context, 'hosts/:id'), route('host.html', true))
      .when(UrlHelpers.join(context, 'pipelines'), route('pipelines.html', false))
      .when(UrlHelpers.join(context, 'overview'), route('overview.html', true))
      .when(context, {redirectTo: "/workspaces"});

  // Put kubernetes views under all of these contexts
  angular.forEach([
        context, 
        "/workspaces/:workspace/projects/:project", 
        "/workspaces/:workspace"
      ], 
      (context) => {
        $routeProvider
      .when(UrlHelpers.join(context, '/namespace/:namespace/podCreate'), route('podCreate.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/podEdit/:id'), route('podEdit.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/pods'), route('pods.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/pods/:id'), route('pod.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/replicationControllers'), route('replicationControllers.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/replicationControllers/:id'), route('replicationController.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/replicationControllerCreate'), route('replicationControllerCreate.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/replicationControllerEdit/:id'), route('replicationControllerEdit.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/secrets'), route('secrets.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/secrets/:id'), route('secret.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/secretCreate'), route('secret.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/services'), route('services.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/services/:id'), route('service.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/serviceCreate'), route('serviceCreate.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/serviceEdit/:id'), route('serviceEdit.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/templates'), route('templates.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/events'), route('events.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/hosts'), route('hosts.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/hosts/:id'), route('host.html', true))
      .when(UrlHelpers.join(context, '/namespace/:namespace/apps'), route('apps.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace/overview'), route('overview.html', true))
      .when(UrlHelpers.join(context, '/namespace/:namespace/templates/:targetNamespace'), route('templates.html', false))
      .when(UrlHelpers.join(context, '/namespace/:namespace'), route('apps.html', false))
      .when(UrlHelpers.join(context, 'builds'), route('builds.html', false))
      .when(UrlHelpers.join(context, 'builds/:id'), route('build.html', true))
      .when(UrlHelpers.join(context, 'buildLogs/:id'), route('buildLogs.html', true))
      .when(UrlHelpers.join(context, 'buildConfigs'), route('buildConfigs.html', false))
      .when(UrlHelpers.join(context, 'buildConfigs/:id'), route('buildConfig.html', true))
      .when(UrlHelpers.join(context, 'buildConfigEdit/:id'), route('buildConfigEdit.html', true))
      .when(UrlHelpers.join(context, 'deploymentConfigs'), route('deploymentConfigs.html', false))
      .when(UrlHelpers.join(context, 'deploymentConfigs/:id'), route('deploymentConfig.html', true))
      .when(UrlHelpers.join(context, 'imageRepositories'), route('imageRepositories.html', false))
      });

    angular.forEach([context, "/workspaces/:workspace", "/workspaces/:workspace/projects/:project"], (context) => {
      $routeProvider
        .when(UrlHelpers.join(context, 'buildConfigEdit'), route('buildConfigEdit.html', true))
        .when(UrlHelpers.join(context, 'buildConfigEdit/:id'), route('buildConfigEdit.html', true))
        .when(UrlHelpers.join(context, 'importProject'), route('importProject.html', true))
    });
  }]);


  _module.factory('AppLibraryURL', ['$rootScope', ($rootScope:ng.IRootScopeService) => {
    return UrlHelpers.join(kubernetesApiUrl(), "/proxy", kubernetesNamespacePath(), "/services/app-library");
  }]);

  _module.factory('WikiGitUrlPrefix', () => {
    return UrlHelpers.join(kubernetesApiUrl(), "/proxy", kubernetesNamespacePath(), "services/app-library");
  });

  _module.factory('wikiRepository', ["$location", "localStorage", ($location, localStorage) => {
    return false;
  }]);

  _module.factory('ConnectDialogService', ['$rootScope', ($rootScope:ng.IRootScopeService) => {
    return {
      dialog: new UI.Dialog(),
      saveCredentials: false,
      userName: null,
      password: null,
      jolokiaUrl: null,
      containerName: null,
      view: null
    };
  }]);

  _module.filter('kubernetesPageLink', () => entityPageLink);

  _module.run(['viewRegistry', 'ServiceRegistry', 'HawtioNav', 'KubernetesModel', '$templateCache', (viewRegistry, ServiceRegistry, HawtioNav, KubernetesModel, $templateCache) => {

    log.debug("Running");
    viewRegistry['kubernetes'] = templatePath + 'layoutKubernetes.html';
    var builder = HawtioNav.builder();
    var apps = builder.id('kube-apps')
      .href(() => UrlHelpers.join(context, 'apps'))
      .title(() => 'Apps')
      .build();

    var services = builder.id('kube-services')
      .href(() => UrlHelpers.join(context, 'services'))
      .title(() => 'Services')
      .build();

    var controllers = builder.id('kube-controllers')
      .href(() => UrlHelpers.join(context, 'replicationControllers'))
      .title(() => 'Controllers')
      .build();

    var pods = builder.id('kube-pods')
      .href(() => UrlHelpers.join(context, 'pods'))
      .title(() => 'Pods')
      .build();

    var events = builder.id('kube-events')
      .href(() => UrlHelpers.join(context, 'events'))
      .title(() => 'Events')
      .build();

    var hosts = builder.id('kube-hosts')
      .href(() => UrlHelpers.join(context, 'hosts'))
      .title(() => 'Hosts')
      .build();

    var overview = builder.id('kube-overview')
      .href(() => UrlHelpers.join(context, 'overview'))
      .title(() => 'Diagram')
      .build();

    var builds = builder.id('kube-builds')
      .href(() => UrlHelpers.join(context, 'builds'))
      .title(() => 'Builds')
      .build();

    var buildConfigs = builder.id('kube-buildConfigs')
      .href(() => UrlHelpers.join(context, 'buildConfigs'))
      .title(() => 'Build Configs')
      .build();

    var deploys = builder.id('kube-deploys')
      .href(() => UrlHelpers.join(context, 'deploymentConfigs'))
      .title(() => 'Deploys')
      .build();

    var imageRepositories = builder.id('kube-imageRepositories')
      .href(() => UrlHelpers.join(context, 'imageRepositories'))
      .title(() => 'Registries')
      .build();

    var pipelines = builder.id('kube-pipelines')
      .href(() => UrlHelpers.join(context, 'pipelines'))
      .title(() => 'Pipelines')
      .build();

    var repos = builder.id('kube-repos')
      .href(() => "/forge/repos")
      .isValid(() => ServiceRegistry.hasService(fabric8ForgeServiceName) && ServiceRegistry.hasService(gogsServiceName))
      .title(() => 'Repositories')
      .build();

    var mainTab = builder.id('kubernetes')
      .rank(200)
      .defaultPage({
        rank: 20,
        isValid: (yes, no) => {
          yes();
        }
      })
      .href(() => context)
      .title(() => 'Kubernetes')
      .tabs(apps, services, controllers, pods, events, hosts, overview)
      .build();
    HawtioNav.add(mainTab);

    /* test
    HawtioNav.add({
      id: 'k8sAppSwitcher',
      title: () => '', // not used as 'template' below overrides this
      isValid: () => KubernetesModel.serviceApps.length > 0,
      context: true,
      template: () => $templateCache.get(UrlHelpers.join(templatePath, 'serviceApps.html'))
    });
    */

    var projectsTab = builder.id('openshift')
      .rank(100)
      .href(() => UrlHelpers.join(context, 'buildConfigs') + '?sub-tab=kube-buildConfigs')
      .title(() => 'Projects')
      // lets disable the pipelines view for now
      // pipelines,
      .tabs(repos, buildConfigs, builds, deploys, imageRepositories)
      .build();

    HawtioNav.add(projectsTab);
  }]);

  hawtioPluginLoader.registerPreBootstrapTask({
    name: 'KubernetesInit',
    task: (next) => {
      $.getScript('osconsole/config.js')
        .done((script, textStatus) => {
          var config:KubernetesConfig = Kubernetes.osConfig = window['OPENSHIFT_CONFIG'];
          log.debug("Fetched OAuth config: ", config);
          var master:string = config.master_uri;
          if (!master && config.api && config.api.k8s) {
            var masterUri = new URI().host(config.api.k8s.hostPort).path("").query("");
            if (config.api.k8s.proto) {
              masterUri.protocol(config.api.k8s.proto);
            }
            master = masterUri.toString();
          }

          OSOAuthConfig = config.openshift;
          GoogleOAuthConfig = config.google;
          KeycloakConfig = config.keycloak;

          if (OSOAuthConfig && !master) {
            // TODO auth.master_uri no longer used right?
            // master = OSOAuthConfig.master_uri;
            if (!master) {
              var oauth_authorize_uri = OSOAuthConfig.oauth_authorize_uri;
              if (oauth_authorize_uri) {
                var text = oauth_authorize_uri;
                var idx = text.indexOf("://");
                if (idx > 0) {
                  idx += 3;
                  idx = text.indexOf("/", idx);
                  if (idx > 0) {
                    master = text.substring(0, ++idx);
                  }
                }
              }
            }
          }
          if ((!Kubernetes.masterUrl || Kubernetes.masterUrl === "/") && (!master || master === "/")) {
            // lets default the master to the current protocol and host/port
            // in case the master url is "/" and we are
            // serving up static content from inside /api/v1/namespaces/default/services/fabric8 or something like that
            var href = location.href;
            if (href) {
              master = new URI(href).query("").path("").toString();
            }
          }
          if (master) {
            Kubernetes.masterUrl = master;
            next();
            return;
          }
        })
        .fail((response) => {
          log.debug("Error fetching OAUTH config: ", response);
        })
        .always(() => {
          next();
        });
    }
  }, true);

  hawtioPluginLoader.addModule('ngResource');
  hawtioPluginLoader.addModule(pluginName);
}
