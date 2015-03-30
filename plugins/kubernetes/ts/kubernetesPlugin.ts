/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesModel.ts"/>
declare var OSOAuthConfig:any;

module Kubernetes {

  export var _module = angular.module(pluginName, ['hawtio-core', 'hawtio-ui', 'wiki', 'restmod']);
  export var controller = PluginHelpers.createControllerFunction(_module, pluginName);
  export var route = PluginHelpers.createRoutingFunction(templatePath);

  _module.config(['$routeProvider', ($routeProvider:ng.route.IRouteProvider) => {
    $routeProvider.when(UrlHelpers.join(context, '/pods'), route('pods.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/podCreate'), route('podCreate.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/podEdit/:id'), route('podEdit.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/pods'), route('pods.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/pods/:id'), route('pod.html', false))
                  .when(UrlHelpers.join(context, 'replicationControllers'), route('replicationControllers.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/replicationControllers'), route('replicationControllers.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/replicationControllers/:id'), route('replicationController.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/replicationControllerCreate'), route('replicationControllerCreate.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/replicationControllerEdit/:id'), route('replicationControllerEdit.html', false))
                  .when(UrlHelpers.join(context, 'services'), route('services.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/services'), route('services.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/services/:id'), route('service.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/serviceCreate'), route('serviceCreate.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/serviceEdit/:id'), route('serviceEdit.html', false))
                  .when(UrlHelpers.join(context, 'apps'), route('apps.html', false))
                  .when(UrlHelpers.join(context, 'apps/:namespace'), route('apps.html', false))
                  .when(UrlHelpers.join(context, 'hosts'), route('hosts.html', false))
                  .when(UrlHelpers.join(context, 'hosts/:id'), route('host.html', true))
                  .when(UrlHelpers.join(context, 'builds'), route('builds.html', false))
                  .when(UrlHelpers.join(context, 'builds/:id'), route('build.html', true))
                  .when(UrlHelpers.join(context, 'buildLogs/:id'), route('buildLogs.html', true))
                  .when(UrlHelpers.join(context, 'buildConfigs'), route('buildConfigs.html', false))
                  .when(UrlHelpers.join(context, 'buildConfigs/:id'), route('buildConfig.html', true))
                  .when(UrlHelpers.join(context, 'buildConfigEdit/:id'), route('buildConfigEdit.html', true))
                  .when(UrlHelpers.join(context, 'buildConfigCreate'), route('buildConfigCreate.html', true))
                  .when(UrlHelpers.join(context, 'deploymentConfigs'), route('deploymentConfigs.html', false))
                  .when(UrlHelpers.join(context, 'deploymentConfigs/:id'), route('deploymentConfig.html', true))
                  .when(UrlHelpers.join(context, 'imageRepositories'), route('imageRepositories.html', false))
                  .when(UrlHelpers.join(context, 'pipelines'), route('pipelines.html', false))
                  .when(UrlHelpers.join(context, 'overview'), route('overview.html', true))
                  .when(context, { redirectTo: UrlHelpers.join(context, 'apps') });
  }]);

  // set up a promise that supplies the API URL for Kubernetes, proxied if necessary
  _module.factory('KubernetesApiURL', ['jolokiaUrl', 'jolokia', '$q', '$rootScope', (jolokiaUrl:string, jolokia:Jolokia.IJolokia, $q:ng.IQService, $rootScope:ng.IRootScopeService) => {
    var url = "/kubernetes/";
    var answer = <ng.IDeferred<string>>$q.defer();
    answer.resolve(url);
    return answer.promise;
  }]);

  _module.factory('AppLibraryURL', ['$rootScope', ($rootScope:ng.IRootScopeService) => {
    return "/kubernetes/api/" + defaultApiVersion + "/proxy/services/app-library";
  }]);

  _module.factory('WikiGitUrlPrefix', () => {
    return "kubernetes/api/" + defaultApiVersion + "/proxy/services/app-library";
  });

  _module.factory('wikiRepository', ["$location", "localStorage", ($location, localStorage) => {
    // TODO lets switch to using REST rather than jolokia soon for the wiki

    var url = "/kubernetes/api/" + defaultApiVersion + "/proxy/services/app-library-jolokia/jolokia";
    // TODO what to use here...
    var user = "admin";
    var password = "admin";
    var jolokia = Core.createJolokia(url, user, password);
    var workspace = Core.createRemoteWorkspace(jolokia, $location, localStorage);

    return new Wiki.GitWikiRepository(() => {
      console.log("Creating a using the jolokia URL: " + url);
      var gitRepo = Git.createGitRepository(workspace, jolokia, localStorage);
      console.log("Got git based repo: " + gitRepo);
      return gitRepo;
    });
  }]);

  _module.factory('ConnectDialogService', ['$rootScope', ($rootScope:ng.IRootScopeService) => {
    return  {
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


  function createResource(deferred:ng.IDeferred<ng.resource.IResourceClass>, thing:string, urlTemplate:string,
                          $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL: ng.IPromise<string>) {
    KubernetesApiURL.then((KubernetesApiURL) => {
      var url = UrlHelpers.escapeColons(KubernetesApiURL);
      log.debug("Url for ", thing, ": ", url);
      var resource = $resource(UrlHelpers.join(url, urlTemplate), null, {
        query: { method: 'GET', isArray: false },
        save: { method: 'PUT', params: { id: '@id' } }
      });
      deferred.resolve(resource);
      Core.$apply($rootScope);
    }, (response) => {
      log.debug("Failed to get rest API URL, can't create " + thing + " resource: ", response);
      deferred.reject(response);
      Core.$apply($rootScope);
    });
  }

  _module.factory('KubernetesVersion', ['$q', '$rootScope', '$resource', 'KubernetesApiURL', ($q:ng.IQService, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL: ng.IPromise<string>) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>> $q.defer();
    createResource(answer, 'pods', '/version', $rootScope, $resource, KubernetesApiURL);
    return answer.promise;
  }]);

  _module.factory('KubernetesPods', ['$q', '$rootScope', '$resource', 'KubernetesApiURL', ($q:ng.IQService, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL: ng.IPromise<string>) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>>$q.defer();
    createResource(answer, 'pods', '/api/' + defaultApiVersion + '/pods/:id', $rootScope, $resource, KubernetesApiURL);
    return answer.promise;
  }]);

  _module.factory('KubernetesReplicationControllers', ['$q', '$rootScope', '$resource', 'KubernetesApiURL', ($q:ng.IQService, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL: ng.IPromise<string>) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>>$q.defer();
    createResource(answer, 'replication controllers', '/api/' + defaultApiVersion + '/replicationControllers/:id', $rootScope, $resource, KubernetesApiURL);
    return answer.promise;
  }]);

  _module.factory('KubernetesServices', ['$q', '$rootScope', '$resource', 'KubernetesApiURL', ($q:ng.IQService, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL: ng.IPromise<string>) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>>$q.defer();
    createResource(answer, 'services', '/api/' + defaultApiVersion + '/services/:id', $rootScope, $resource, KubernetesApiURL);
    return answer.promise;
  }]);

  _module.factory('KubernetesBuilds', ['restmod', (restmod) => {
    return restmod.model(buildConfigsRestURL);
  }]);

  _module.factory('KubernetesSchema', ['SchemaRegistry', (SchemaRegistry) => {
    configureSchema();
    SchemaRegistry.addSchema('kubernetes', schema);
    // now lets iterate and add all the definitions too
    angular.forEach(schema.definitions, (definition, typeName) => {
      SchemaRegistry.addSchema(typeName, definition);
      SchemaRegistry.addSchema("#/definitions/" + typeName, definition);
    });
    return schema;
  }]);

  _module.factory('KubernetesState', [() => {
    return {
      namespaces: [],
      selectedNamespace: null
    };
  }]);

  _module.factory('ServiceRegistry', [() => {
    return new ServiceRegistryService();
  }]);

  _module.factory('KubernetesModel', ['$rootScope', '$http', 'AppLibraryURL', 'KubernetesApiURL', 'KubernetesState', 'KubernetesServices', 'KubernetesReplicationControllers', 'KubernetesPods', ($rootScope, $http, AppLibraryURL, KubernetesApiURL, KubernetesState, KubernetesServices, KubernetesReplicationControllers, KubernetesPods) => {
    return createKubernetesModel($rootScope, $http, AppLibraryURL, KubernetesApiURL, KubernetesState, KubernetesServices, KubernetesReplicationControllers, KubernetesPods);
  }]);



  _module.run(['viewRegistry', 'workspace', 'ServiceRegistry', 'HawtioNav', (viewRegistry, workspace:Core.Workspace, ServiceRegistry, HawtioNav) => {
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
                      .isValid(() => ServiceRegistry.hasService("fabric8-forge") && ServiceRegistry.hasService("gogs-http-service") && !Core.isRemoteConnection())
                      .title(() => 'Repositories')
                      .build();

    var mainTab = builder.id('kubernetes')
                         .rank(200)
                         .defaultPage({
                           rank: 20,
                           isValid: (yes, no) => {
                             if (!Core.isRemoteConnection()) {
                               yes();
                             } else {
                               no();
                             }
                           }
                         })
                         .href(() => context)
                         .title(() => 'Kubernetes')
                         .isValid(() => !Core.isRemoteConnection())
                         .tabs(apps, services, controllers, pods, hosts, overview)
                         .build();
    HawtioNav.add(mainTab);


    var projectsTab = builder.id('openshift')
                         .rank(100)
                         //.href(() => "/forge/repos")
                         .href(() => UrlHelpers.join(context, 'pipelines'))
                         .title(() => 'Projects')
                         .isValid(() => !Core.isRemoteConnection())
                         .tabs(repos, pipelines, builds, buildConfigs, deploys, imageRepositories)
                         .build();

    HawtioNav.add(projectsTab);

    // lets disable connect
    var navItems = HawtioNav.items || [];
    var connect = navItems.find((item) => item.id === "jvm");
    if (connect) {
      connect.isValid = () => false;
    }
    // images plugin doesn't work yet...
    var dockerRegistry = navItems.find((item) => item.id === "docker-registry");
    if (dockerRegistry) {
      dockerRegistry.isValid = () => false;
    }

    // disable the forge plugin tab
    var forge = navItems.find((item) => item.id === "forge");
    if (forge) {
      forge.isValid = () => false;
    }
    var wiki = navItems.find((item) => item.id === "wiki");
    if (wiki) {
      wiki.isValid = () => false;
    }

    workspace.topLevelTabs.push({
      id: 'library',
      content: 'Library',
      title: 'View the library of applications',
      isValid: (workspace) => ServiceRegistry.hasService("app-library") && ServiceRegistry.hasService("app-library-jolokia") && !Core.isRemoteConnection(),
      href: () => "/wiki/view",
      isActive: (workspace) => false
    });

    workspace.topLevelTabs.push({
      id: 'kibana',
      content: 'Logs',
      title: 'View and search all logs across all containers using Kibana and ElasticSearch',
      isValid: (workspace) => ServiceRegistry.hasService("kibana-service") && !Core.isRemoteConnection(),
      href: () => kibanaLogsLink(ServiceRegistry),
      isActive: (workspace) => false
    });

    workspace.topLevelTabs.push({
      id: 'grafana',
      content: 'Metrics',
      title: 'Views metrics across all containers using Grafana and InfluxDB',
      isValid: (workspace) => ServiceRegistry.hasService("grafana-service") && !Core.isRemoteConnection(),
      href: () => ServiceRegistry.serviceLink("grafana-service"),
      isActive: (workspace) => false
    });

    workspace.topLevelTabs.push({
      id: 'kiwiirc',
      content: 'Chat',
      title: 'Chat room for discussing this namespace',
      isValid: (workspace) => ServiceRegistry.hasService("kiwiirc") && !Core.isRemoteConnection(),
      href: () => {
        var answer = ServiceRegistry.serviceLink("kiwiirc");
        if (answer) {
          var ircHost = "";
          var ircService = ServiceRegistry.findService("hubot");
          if (ircService) {
            ircHost = ircService.portalIP;
          }
          if (ircHost) {
            var nick = localStorage["gogsUser"] || localStorage["ircNick"] || "myname";
            var room = "#fabric8-" +  currentKubernetesNamespace();
            answer = UrlHelpers.join(answer, "/kiwi", ircHost, "?&nick=" + nick + room);
          }
        }
        return answer;
      },
      isActive: (workspace) => false
    });

    // TODO we should move this to a nicer link inside the Library soon - also lets hide until it works...
/*
    workspace.topLevelTabs.push({
      id: 'createProject',
      content: 'Create',
      title: 'Creates a new project',
      isValid: (workspace) => ServiceRegistry.hasService("app-library") && false,
      href: () => "/project/create"
    });
*/


  }]);


  hawtioPluginLoader.registerPreBootstrapTask((next) => {
    $.getScript('osconsole/config.js')
      .done((script, textStatus) => {
        var config = window['OPENSHIFT_CONFIG'];
        log.debug("Fetched openshift config: ", config);
        OSOAuthConfig = config['auth'];
      })
      .fail((response) => {
        log.debug("Error fetching OAUTH config: ", response);
      })
      .always(() => {
        next();
      });
  }, true);

  hawtioPluginLoader.addModule(pluginName);
}
