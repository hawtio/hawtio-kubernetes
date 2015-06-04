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

  // TODO this doesn't need to be a service really
  _module.factory('KubernetesApiURL', () => kubernetesApiUrl());

  // TODO we'll get rid of this...
  _module.factory('KubernetesVersion', [() => {
    return {
      query: () => null
    }
  }]);

  // TODO let's move these into KubernetesModel so controllers don't have to inject them separately
  _module.factory('KubernetesPods', ['KubernetesModel', (KubernetesModel) => {
    return KubernetesModel['podsResource'];
  }]);

  _module.factory('KubernetesReplicationControllers', ['KubernetesModel', (KubernetesModel) => {
    return KubernetesModel['replicationcontrollersResource'];
  }]);

  _module.factory('KubernetesServices', ['KubernetesModel', (KubernetesModel) => {
    return KubernetesModel['servicesResource'];
  }]);

  _module.factory('KubernetesBuilds', ['restmod', (restmod) => {
    return restmod.model(buildConfigsRestURL());
  }]);

}
