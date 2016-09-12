/// <reference path="../../includes.d.ts" />
/// <reference path="kubernetesPlugin.d.ts" />
declare module Kubernetes {
    var FABRIC8_PROJECT_JSON: string;
    var environemntsConfigMapName: string;
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
        appInfos: any[];
        appViews: any[];
        appFolders: any[];
        replicasets: any[];
        replicas: any[];
        deployments: any[];
        deploymentconfigs: any[];
        allDeployments: any[];
        ingresses: any[];
        routes: any[];
        templates: any[];
        redraw: boolean;
        resourceVersions: {};
        deploymentsByKey: {};
        podsByHost: {};
        servicesByKey: {};
        replicationControllersByKey: {};
        replicasByKey: {};
        podsByKey: {};
        namespaceEnvironments: {};
        fetched: boolean;
        isFetched(kind: string): boolean;
        showRunButton: boolean;
        configmaps: any[];
        environments: any[];
        buildconfigs: any[];
        events: any[];
        workspaces: any[];
        projects: any[];
        project: any;
        watcher: WatcherService;
        serviceApps: Array<any>;
        $keepPolling(): boolean;
        orRedraw(flag: any): void;
        getService(namespace: any, id: any): any;
        getReplicationController(namespace: any, id: any): any;
        getNamespaceOrProject(name: any): any;
        getDeployment(namespace: any, id: any): any;
        getPod(namespace: any, id: any): any;
        podsForNamespace(namespace?: any): any[];
        getBuildConfig(name: any): any;
        findObject(kind: any, name: any): {};
        objectsWithLabels(desiredLabels: any): any[];
        getProject(name: any, ns?: any): any;
        setProject(buildConfig: any): void;
        /**
         * Returns the current selected namespace or the default namespace
         */
        currentNamespace(): any;
        protected updateIconUrlAndAppInfo(entity: any, nameField: string): void;
        maybeInit(): void;
        protected updateApps(): void;
        /**
         * Returns the name of the environment for the given project namespace and environment namespace
         */
        environmentName(projectNamespace: any, environmentNamespace: any): any;
        /**
         * Loads the environments for the given project
         */
        protected loadEnvironments(): any[];
        createEnvironment(key: any, values: any, ns: any): any;
        protected discoverPodConnections(entity: any): void;
    }
    function getJenkinshiftBuildConfigURL($scope: any): string;
}
