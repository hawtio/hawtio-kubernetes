/// <reference path="../../includes.d.ts" />
declare module Kubernetes {
    var context: string;
    var hash: string;
    var defaultRoute: string;
    var pluginName: string;
    var templatePath: string;
    var log: Logging.Logger;
    var defaultApiVersion: string;
    var appSuffix: string;
    interface KubePod {
        id: string;
        namespace: string;
    }
    var mbean: string;
    var managerMBean: string;
    var appViewMBean: string;
    function isKubernetes(workspace: any): any;
    function isKubernetesTemplateManager(workspace: any): any;
    function isAppView(workspace: any): any;
    /**
     * Updates the namespaces value in the kubernetes object from the namespace values in the pods, controllers, services
     */
    function updateNamespaces(kubernetes: any, pods?: any[], replicationControllers?: any[], services?: any[]): void;
    function setJson($scope: any, id: any, collection: any): void;
    /**
     * Returns the labels text string using the <code>key1=value1,key2=value2,....</code> format
     */
    function labelsToString(labels: any, seperatorText?: string): string;
    function initShared($scope: any, $location: any): void;
    /**
     * Given the list of pods lets iterate through them and find all pods matching the selector
     * and return counters based on the status of the pod
     */
    function createPodCounters(selector: any, pods: any): {
        podsLink: string;
        valid: number;
        waiting: number;
        error: number;
    };
    /**
     * Runs the given application JSON
     */
    function runApp($location: any, jolokia: any, $scope: any, json: any, name?: string, onSuccessFn?: any, namespace?: any): void;
    /**
     * Returns true if the current status of the pod is running
     */
    function isRunning(podCurrentState: any): any;
    /**
     * Returns true if the labels object has all of the key/value pairs from the selector
     */
    function selectorMatches(selector: any, labels: any): boolean;
    /**
     * Returns a link to the kibana logs web application
     */
    function kibanaLogsLink(ServiceRegistry: any): string;
    function openLogsForPods(ServiceRegistry: any, $window: any, pods: any): void;
    function resizeController($http: any, KubernetesApiURL: any, id: any, newReplicas: any, onCompleteFn?: any): void;
    function statusTextToCssClass(text: any): string;
}
