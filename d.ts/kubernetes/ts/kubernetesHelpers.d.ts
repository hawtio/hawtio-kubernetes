/// <reference path="../../includes.d.ts" />
/// <reference path="kubernetesInterfaces.d.ts" />
/// <reference path="../../developer/ts/developerNavigation.d.ts" />
declare module Kubernetes {
    var context: string;
    var hash: string;
    var defaultRoute: string;
    var pluginName: string;
    var pluginPath: string;
    var templatePath: string;
    var log: Logging.Logger;
    var keepPollingModel: boolean;
    var defaultIconUrl: string;
    var hostIconUrl: string;
    var osConfig: KubernetesConfig;
    var masterUrl: string;
    var defaultApiVersion: string;
    var defaultOSApiVersion: string;
    var labelFilterTextSeparator: string;
    var defaultNamespace: string;
    var appSuffix: string;
    var kibanaServiceName: string;
    var fabric8ForgeServiceName: string;
    var gogsServiceName: string;
    var jenkinsServiceName: string;
    var apimanServiceName: string;
    var isOpenShift: boolean;
    var sshSecretDataKeys: string[];
    var httpsSecretDataKeys: string[];
    function kubernetesNamespacePath(): string;
    function apiPrefix(): string;
    function osApiPrefix(): string;
    function masterApiUrl(): string;
    /** WARNING - this excludes the host name - you probably want to use: kubernetesApiUrl() instead!! */
    function kubernetesApiPrefix(): string;
    function kubernetesExperimentalApiPrefix(): string;
    function openshiftApiPrefix(): string;
    function prefixForType(type: string): string;
    function kubernetesApiUrl(): string;
    function kubernetesExperimentalApiUrl(): string;
    function openshiftApiUrl(): string;
    function resourcesUriForKind(type: any, ns?: any): string;
    function uriTemplateForKubernetesKind(type: any): string;
    function namespacePathForKind(type: any, ns: any): string;
    /**
     * Returns thevalue from the injector if its available or null
     */
    function inject<T>(name: any): T;
    function createResource(thing: string, urlTemplate: string, $resource: ng.resource.IResourceService, KubernetesModel: any): ng.resource.IResourceClass<ng.resource.IResource<any>>;
    function imageRepositoriesRestURL(): string;
    function deploymentConfigsRestURL(): string;
    function buildsRestURL(): string;
    function buildConfigHooksRestURL(): string;
    function buildConfigsRestURL(): string;
    function routesRestURL(): string;
    function templatesRestURL(): string;
    function getNamespace(entity: any): any;
    function getLabels(entity: any): any;
    function getAnnotations(entity: any): any;
    function getAnnotation(entity: any, annotation: any): any;
    function getName(entity: any): any;
    function getNamed(array: any, name: string): any;
    function getKind(entity: any): any;
    function getSelector(entity: any): any;
    function getHost(pod: any): any;
    function getStatus(pod: any): any;
    function getPorts(service: any): any;
    function getCreationTimestamp(entity: any): any;
    var mbean: string;
    var managerMBean: string;
    var appViewMBean: string;
    function getKubernetesModel(): KubernetesModelService;
    function isAppView(workspace?: any): boolean;
    function getStrippedPathName(): string;
    function linkContains(...words: String[]): boolean;
    /**
     * Returns true if the given link is active. The link can omit the leading # or / if necessary.
     * The query parameters of the URL are ignored in the comparison.
     * @method isLinkActive
     * @param {String} href
     * @return {Boolean} true if the given link is active
     */
    function isLinkActive(href: string): boolean;
    function setJson($scope: any, id: any, collection: any): void;
    /**
     * Returns the labels text string using the <code>key1=value1,key2=value2,....</code> format
     */
    function labelsToString(labels: any, seperatorText?: string): string;
    function initShared($scope: any, $location: any, $http: any, $timeout: any, $routeParams: any, KubernetesModel: any, KubernetesState: any, KubernetesApiURL: any): void;
    /**
     * Returns the number of pods that are ready
     */
    function readyPodCount(service: any): number;
    /**
     * Returns the service link URL for either the service name or the service object
     */
    function serviceLinkUrl(service: any, httpOnly?: boolean): any;
    /**
     * Returns the total number of counters for the podCounters object
     */
    function podCounterTotal($podCounters: any): number;
    /**
     * Given the list of pods lets iterate through them and find all pods matching the selector
     * and return counters based on the status of the pod
     */
    function createPodCounters(selector: any, pods: any, outputPods?: any[], podLinkQuery?: any, podLinkUrl?: any): {
        podsLink: string;
        ready: number;
        valid: number;
        waiting: number;
        error: number;
    };
    /**
     * Converts the given json into an array of items. If the json contains a nested set of items then that is sorted; so that services
     * are processed first; then turned into an array. Otherwise the json is put into an array so it can be processed polymorphically
     */
    function convertKubernetesJsonToItems(json: any): any[];
    function isV1beta1Or2(): boolean;
    /**
     * Returns a link to the detail page for the given entity
     */
    function entityPageLink(obj: any): string;
    function resourceKindToUriPath(kind: any): string;
    /**
     * Returns the root URL for the kind
     */
    function kubernetesUrlForKind(KubernetesApiURL: any, kind: any, namespace?: any, path?: any): string;
    /**
     * Returns the base URL for the kind of kubernetes resource or null if it cannot be found
     */
    function kubernetesUrlForItemKind(KubernetesApiURL: any, json: any): string;
    function kubernetesProxyUrlForService(KubernetesApiURL: any, service: any, path?: any): string;
    function kubernetesProxyUrlForServiceCurrentNamespace(service: any, path?: any): string;
    function buildConfigRestUrl(id: any): string;
    function deploymentConfigRestUrl(id: any): string;
    function imageRepositoryRestUrl(id: any): string;
    function buildRestUrl(id: any): string;
    function buildLogsRestUrl(id: any): string;
    /**
     * Runs the given application JSON
     */
    function runApp($location: any, $scope: any, $http: any, KubernetesApiURL: any, json: any, name?: string, onSuccessFn?: any, namespace?: any, onCompleteFn?: any): void;
    /**
     * Returns true if the current status of the pod is running
     */
    function isRunning(podCurrentState: any): any;
    /**
     * Returns true if the labels object has all of the key/value pairs from the selector
     */
    function selectorMatches(selector: any, labels: any): boolean;
    /**
     * Returns the service registry
     */
    function getServiceRegistry(): any;
    /**
     * Returns a link to the kibana logs web application
     */
    function kibanaLogsLink(ServiceRegistry: any): string;
    function openLogsForPods(ServiceRegistry: any, $window: any, namespace: any, pods: any): void;
    function resizeController($http: any, KubernetesApiURL: any, replicationController: any, newReplicas: any, onCompleteFn?: any): void;
    function statusTextToCssClass(pod: any): string;
    function podStatus(pod: any): any;
    function isReady(pod: any): boolean;
    function createAppViewPodCounters(appView: any): any[];
    function createAppViewServiceViews(appView: any): any[];
    /**
     * converts a git path into an accessible URL for the browser
     */
    function gitPathToUrl(iconPath: any, branch?: string): string;
    function enrichBuildConfig(buildConfig: any, sortedBuilds: any): void;
    function enrichBuildConfigs(buildConfigs: any, sortedBuilds?: any): any;
    function enrichBuilds(builds: any): {}[];
    function enrichBuild(build: any): any;
    function enrichDeploymentConfig(deploymentConfig: any): void;
    function enrichDeploymentConfigs(deploymentConfigs: any): any;
    function enrichEvent(event: any): void;
    function enrichEvents(events: any, model?: any): any;
    function enrichImageRepository(imageRepository: any): void;
    function enrichImageRepositories(imageRepositories: any): any;
    function containerLabelClass(labelType: string): string;
    /**
     * Returns true if the fabric8 forge plugin is enabled
     */
    function isForgeEnabled(): boolean;
    /**
     * Returns the current kubernetes selected namespace or the default one
     */
    function currentKubernetesNamespace(): any;
    function setCurrentKubernetesNamespace(ns: any): void;
    /**
     * Configures the json schema
     */
    function configureSchema(): void;
    /**
     * Lets remove any enriched data to leave the original json intact
     */
    function unenrich(item: any): any;
    /**
     * Returns the unenriched JSON representation of an object
     */
    function toRawJson(item: any): string;
    /**
     * Returns the unenriched YAML representation of an object
     */
    function toRawYaml(item: any): any;
    /**
     * Helper function to set up a KubernetesAPI watch and automatically
     * close the watch when the view closes
     */
    function watch($scope: any, $element: any, kind: any, ns: any, fn: any, labelSelector?: any): any;
    /**
     * Helper wrapper to create a KubernetesAPI client instance, for
     * simple puts/deletes though use KubernetesAPI.put() or
     * KubernetesAPI.del()
     */
    function createKubernetesClient(kind: any, ns?: any): any;
    function currentUserName(): any;
    function getNamespaceKind(): string;
    function newNamespaceObject(namespace: string): any;
    function deleteNamespace(ns: any, client?: any, success?: (data: any) => void, error?: (err: any) => void): void;
    function createNamespace(ns: any, client?: any, success?: (data: any) => void, error?: (err: any) => void): void;
}
