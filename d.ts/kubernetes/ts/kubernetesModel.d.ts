/// <reference path="../../includes.d.ts" />
/// <reference path="kubernetesHelpers.d.ts" />
declare module Kubernetes {
    /**
     * The object which keeps track of all the pods, replication controllers, services and their associations
     */
    class KubernetesModelService {
        kubernetes: any;
        apps: any[];
        services: any[];
        replicationControllers: any[];
        pods: any[];
        hosts: any[];
        namespaces: any[];
        redraw: boolean;
        resourceVersions: {};
        hostsByKey: {};
        servicesByKey: {};
        replicationControllersByKey: {};
        podsByKey: {};
        appInfos: any[];
        appViews: any[];
        appFolders: any[];
        fetched: boolean;
        fetch: () => void;
        $keepPolling(): boolean;
        orRedraw(flag: any): void;
        getService(namespace: any, id: any): any;
        getReplicationController(namespace: any, id: any): any;
        getPod(namespace: any, id: any): any;
        protected updateIconUrlAndAppInfo(entity: any, nameField: string): void;
        maybeInit(): void;
        protected updateApps(): void;
        protected discoverPodConnections(entity: any): void;
    }
    /**
     * Creates a model service which keeps track of all the pods, replication controllers and services along
     * with their associations and status
     */
    function createKubernetesModel($rootScope: any, $http: any, AppLibraryURL: any, KubernetesApiURL: any, KubernetesState: any, KubernetesServices: any, KubernetesReplicationControllers: any, KubernetesPods: any): KubernetesModelService;
}
