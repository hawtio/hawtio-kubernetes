/// <reference path="../../includes.d.ts" />
declare module Service {
    var pluginName: string;
    var log: Logging.Logger;
    /**
     * Used to specify whether the "service" URL should be polled for services using kubernetes or kubernetes-like service discover.
     * For more details see: https://github.com/hawtio/hawtio/blob/master/docs/Services.md
     */
    var pollServices: boolean;
    /**
     * Returns true if there is a service available for the given ID or false
     */
    function hasService(ServiceRegistry: any, serviceName: string): boolean;
    /**
     * Returns the service for the given service name (ID) or null if it cannot be found
     *
     * @param ServiceRegistry
     * @param serviceName
     * @return {null}
     */
    function findService(ServiceRegistry: any, serviceName: string): any;
    /**
     * Returns the service link for the given service name
     *
     * @param ServiceRegistry
     * @param serviceName
     * @return {null}
     */
    function serviceLink(ServiceRegistry: any, serviceName: string): string;
}
