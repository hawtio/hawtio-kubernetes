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

  function createResource(thing:string, urlTemplate:string, $resource: ng.resource.IResourceService) {
    var url = UrlHelpers.join(kubernetesApiUrl(), urlTemplate);
    log.debug("Url for ", thing, ": ", url);
    var resource = $resource(url, null, {
      query: { method: 'GET', isArray: false, params: {
        namespace: currentKubernetesNamespace, 
      }},
      save: { method: 'PUT', params: { 
        id: '@id', 
        namespace: currentKubernetesNamespace, 
      }},
      delete: { method: 'DELETE', params: {
        id: '@id', 
        namespace: currentKubernetesNamespace, 
      }}
    });
    return resource;
  }

  // TODO we'll get rid of this...
  _module.factory('KubernetesVersion', [() => {
    return {
      query: () => null
    }
  }]);

  // TODO let's move these into KubernetesModel so controllers don't have to inject them separately
  _module.factory('KubernetesPods', ['$resource', ($resource: ng.resource.IResourceService) => {
    return createResource('pods', 'namespaces/:namespace/pods/:id', $resource);
  }]);

  _module.factory('KubernetesReplicationControllers', ['$resource', ($resource: ng.resource.IResourceService) => {
    return createResource('replication controllers', 'namespaces/:namespace/replicationcontrollers/:id', $resource);
  }]);

  _module.factory('KubernetesServices', ['$resource', ($resource: ng.resource.IResourceService) => {
    return createResource('services', 'namespaces/:namespace/services/:id', $resource);
  }]);

  _module.factory('KubernetesBuilds', ['restmod', (restmod) => {
    return restmod.model(buildConfigsRestURL());
  }]);

}
