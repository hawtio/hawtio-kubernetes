/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesModel.ts"/>

module Kubernetes {

  export var _module = angular.module(pluginName, ['hawtio-core', 'hawtio-ui', 'wiki']);
  export var controller = PluginHelpers.createControllerFunction(_module, pluginName);
  export var route = PluginHelpers.createRoutingFunction(templatePath);

  _module.config(['$routeProvider', ($routeProvider:ng.route.IRouteProvider) => {
    $routeProvider.when(UrlHelpers.join(context, '/pods'), route('pods.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/pods'), route('pods.html', false))
                  .when(UrlHelpers.join(context, 'replicationControllers'), route('replicationControllers.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/replicationControllers'), route('replicationControllers.html', false))
                  .when(UrlHelpers.join(context, 'services'), route('services.html', false))
                  .when(UrlHelpers.join(context, '/namespace/:namespace/services'), route('services.html', false))
                  .when(UrlHelpers.join(context, 'apps'), route('apps.html', false))
                  .when(UrlHelpers.join(context, 'apps/:namespace'), route('apps.html', false))
                  .when(UrlHelpers.join(context, 'overview'), route('overview.html', false))
                  .when(context, { redirectTo: UrlHelpers.join(context, 'apps') });
  }]);

  // set up a promise that supplies the API URL for Kubernetes, proxied if necessary
  _module.factory('KubernetesApiURL', ['jolokiaUrl', 'jolokia', '$q', '$rootScope', (jolokiaUrl:string, jolokia:Jolokia.IJolokia, $q:ng.IQService, $rootScope:ng.IRootScopeService) => {
    var url = "/services/kubernetes/";
    var answer = <ng.IDeferred<string>>$q.defer();
    answer.resolve(url);
    return answer.promise;

/*
    var answer = <ng.IDeferred<string>>$q.defer();
    jolokia.getAttribute(Kubernetes.mbean, 'KubernetesAddress', undefined,
      <Jolokia.IParams> Core.onSuccess((response) => {
        var proxified = UrlHelpers.maybeProxy(jolokiaUrl, response);
        log.debug("discovered API URL:", proxified);
        answer.resolve(proxified);
        Core.$apply($rootScope);
      }, {
        error: (response) => {
          log.debug("error fetching API URL: ", response);
          answer.reject(response);
          Core.$apply($rootScope);
        }
      }));
*/
  }]);

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
    createResource(answer, 'pods', '/api/v1beta1/pods/:id', $rootScope, $resource, KubernetesApiURL);
    return answer.promise;
  }]);

  _module.factory('KubernetesReplicationControllers', ['$q', '$rootScope', '$resource', 'KubernetesApiURL', ($q:ng.IQService, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL: ng.IPromise<string>) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>>$q.defer();
    createResource(answer, 'replication controllers', '/api/v1beta1/replicationControllers/:id', $rootScope, $resource, KubernetesApiURL);
    return answer.promise;
  }]);

  _module.factory('KubernetesServices', ['$q', '$rootScope', '$resource', 'KubernetesApiURL', ($q:ng.IQService, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL: ng.IPromise<string>) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>>$q.defer();
    createResource(answer, 'services', '/api/v1beta1/services/:id', $rootScope, $resource, KubernetesApiURL);
    return answer.promise;
  }]);

  _module.factory('KubernetesState', [() => {
    return {
      namespaces: [],
      selectedNamespace: null
    };
  }]);

  _module.factory('KubernetesModel', ['$rootScope', 'KubernetesState', 'KubernetesServices', 'KubernetesReplicationControllers', 'KubernetesPods', ($rootScope, KubernetesState, KubernetesServices, KubernetesReplicationControllers, KubernetesPods) => {
    return createKubernetesModel($rootScope, KubernetesState, KubernetesServices, KubernetesReplicationControllers, KubernetesPods);
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

    var overview = builder.id('kube-overview')
                          .href(() => UrlHelpers.join(context, 'overview'))
                          .title(() => 'Diagram')
                          .build();

    var mainTab = builder.id('kubernetes')
                         .href(() => context)
                         .title(() => 'Kubernetes')
                         .isValid(() => isKubernetes(workspace))
                         .tabs(apps, services, controllers, pods, overview)
                         .build();

    HawtioNav.add(mainTab);

    /*
    workspace.topLevelTabs.push({
      id: 'kubernetes',
      content: 'Kubernetes',
      isValid: (workspace:Core.Workspace) => isKubernetes(workspace),
      isActive: (workspace:Core.Workspace) => workspace.isLinkActive('kubernetes'),
      href: () => defaultRoute
    });
    */

    workspace.topLevelTabs.push({
      id: 'kibana',
      content: 'Logs',
      title: 'View and search all logs across all containers using Kibana and ElasticSearch',
      isValid: (workspace) => Service.hasService(ServiceRegistry, "kibana-service"),
      href: () => kibanaLogsLink(ServiceRegistry),
      isActive: (workspace) => false
    });

    workspace.topLevelTabs.push({
      id: 'grafana',
      content: 'Metrics',
      title: 'Views metrics across all containers using Grafana and InfluxDB',
      isValid: (workspace) => Service.hasService(ServiceRegistry, "grafana-service"),
      href: () => Service.serviceLink(ServiceRegistry, "grafana-service"),
      isActive: (workspace) => false
    });


  }]);

  hawtioPluginLoader.addModule(pluginName);
}
