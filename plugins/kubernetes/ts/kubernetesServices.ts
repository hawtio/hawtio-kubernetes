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

  _module.constant('KubernetesApiURL', kubernetesApiUrl());

  function createResource(deferred:ng.IDeferred<ng.resource.IResourceClass>, thing:string, urlTemplate:string, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL: string) {
    var url = UrlHelpers.join(kubernetesApiUrl(), urlTemplate);
    log.debug("Url for ", thing, ": ", url);
    var resource = $resource(url, null, {
      query: { method: 'GET', isArray: false, params: {
        namespace: currentKubernetesNamespace(), 
        version: defaultApiVersion 
      }},
      save: { method: 'PUT', params: { 
        id: '@id', 
        namespace: currentKubernetesNamespace(), 
        version: defaultApiVersion 
      }},
      delete: { method: 'DELETE', params: {
        id: '@id', 
        namespace: currentKubernetesNamespace(), 
        version: defaultApiVersion 
      }}
    });
    deferred.resolve(resource);
    Core.$apply($rootScope);
  }

  _module.factory('KubernetesVersion', ['$q', '$rootScope', '$resource', 'KubernetesApiURL', ($q:ng.IQService, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>> $q.defer();
    createResource(answer, 'pods', '/version', $rootScope, $resource, KubernetesApiURL);
    return answer.promise;
  }]);

  _module.factory('KubernetesPods', ['$q', '$rootScope', '$resource', 'KubernetesApiURL', ($q:ng.IQService, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>>$q.defer();
    createResource(answer, 'pods', 'namespaces/:namespace/pods/:id', $rootScope, $resource, KubernetesApiURL);
    return answer.promise;
  }]);

  _module.factory('KubernetesReplicationControllers', ['$q', '$rootScope', '$resource', 'KubernetesApiURL', ($q:ng.IQService, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>>$q.defer();
    createResource(answer, 'replication controllers', 'namespaces/:namespace/replicationcontrollers/:id', $rootScope, $resource, KubernetesApiURL);
    return answer.promise;
  }]);

  _module.factory('KubernetesServices', ['$q', '$rootScope', '$resource', 'KubernetesApiURL', ($q:ng.IQService, $rootScope: ng.IRootScopeService, $resource: ng.resource.IResourceService, KubernetesApiURL) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>>$q.defer();
    createResource(answer, 'services', 'namespaces/:namespace/services/:id', $rootScope, $resource, KubernetesApiURL);
    return answer.promise;
  }]);

  _module.factory('KubernetesBuilds', ['restmod', (restmod) => {
    return restmod.model(buildConfigsRestURL());
  }]);

}
