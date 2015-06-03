/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  // facade this to the watcher service
  class KubernetesState {
    constructor(private watcher:WatcherService) {
    }
    get namespaces():Array<string> {
      return _.map(this.watcher.getObjects(WatchTypes.NAMESPACES), (namespace) => {
        return namespace.metadata.name;
      });
    }
    get selectedNamespace():string {
      return this.watcher.getNamespace();
    }
    set selectedNamespace(namespace:string) {
      this.watcher.setNamespace(namespace);
    }
  }

  _module.factory('KubernetesState', ['WatcherService', (watcher:WatcherService) => {
    return new KubernetesState(watcher);
  }]);

  _module.factory('KubernetesApiURL', () => kubernetesApiUrl());

  function createResource(thing:string, urlTemplate:string, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL: string) {
    var url = UrlHelpers.join(kubernetesApiUrl(), urlTemplate);
    log.debug("Url for ", thing, ": ", url);
    var resource = $resource(url, null, {
      query: { method: 'GET', isArray: false, params: {
        namespace: currentKubernetesNamespace(), 
      }},
      save: { method: 'PUT', params: { 
        id: '@id', 
        namespace: currentKubernetesNamespace(), 
      }},
      delete: { method: 'DELETE', params: {
        id: '@id', 
        namespace: currentKubernetesNamespace(), 
      }}
    });
    return resource;
  }

  _module.factory('KubernetesVersion', ['$q', '$rootScope', '$resource', 'KubernetesApiURL', ($q:ng.IQService, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL) => {
    return createResource('pods', '/version', $rootScope, $resource, KubernetesApiURL);
  }]);

  _module.factory('KubernetesPods', ['$q', '$rootScope', '$resource', 'KubernetesApiURL', ($q:ng.IQService, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL) => {
    return createResource('pods', 'namespaces/:namespace/pods/:id', $rootScope, $resource, KubernetesApiURL);
  }]);

  _module.factory('KubernetesReplicationControllers', ['$q', '$rootScope', '$resource', 'KubernetesApiURL', ($q:ng.IQService, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL) => {
    return createResource('replication controllers', 'namespaces/:namespace/replicationcontrollers/:id', $rootScope, $resource, KubernetesApiURL);
  }]);

  _module.factory('KubernetesServices', ['$q', '$rootScope', '$resource', 'KubernetesApiURL', ($q:ng.IQService, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL) => {
    return createResource('services', 'namespaces/:namespace/services/:id', $rootScope, $resource, KubernetesApiURL);
  }]);

  _module.factory('KubernetesBuilds', ['restmod', (restmod) => {
    return restmod.model(buildConfigsRestURL());
  }]);

}
