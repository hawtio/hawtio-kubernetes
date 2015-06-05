/// <reference path="../../includes.d.ts" />
/// <reference path="kubernetesPlugin.d.ts" />
declare module Kubernetes {
    /**
     * The object which keeps track of all the pods, replication controllers, services and their associations
     */
    class KubernetesModelService {
        kubernetes: KubernetesState;
        apps: any[];
        services: any[];
        replicationcontrollers: any[];
        replicationControllers: Array<any>;
        pods: any[];
        hosts: any[];
        namespaces: Array<string>;
        routes: any[];
        templates: any[];
        redraw: boolean;
        resourceVersions: {};
        podsByHost: {};
        servicesByKey: {};
        replicationControllersByKey: {};
        podsByKey: {};
        appInfos: any[];
        appViews: any[];
        appFolders: any[];
        fetched: boolean;
        isOpenShift: boolean;
        fetch: () => void;
        $keepPolling(): boolean;
        orRedraw(flag: any): void;
        getService(namespace: any, id: any): any;
        getReplicationController(namespace: any, id: any): any;
        getPod(namespace: any, id: any): any;
        podsForNamespace(namespace?: any): any[];
        /**
         * Returns the current selected namespace or the default namespace
         */
        currentNamespace(): any;
        protected updateIconUrlAndAppInfo(entity: any, nameField: string): void;
        maybeInit(): void;
        protected updateApps(): void;
        protected discoverPodConnections(entity: any): void;
    }
}
