/// <reference path="../../includes.d.ts" />
/// <reference path="kubernetesHelpers.d.ts" />
/// <reference path="kubernetesPlugin.d.ts" />
/// <reference path="kubernetesModel.d.ts" />
declare module Kubernetes {
    /**
     * Represents a simple interface to service discovery that can be used early on in the application lifecycle before the
     * underlying model has been created via dependency injection
     */
    class ServiceRegistryService {
        private model;
        /**
         * Returns true if there is a service available for the given ID or false
         */
        hasService(serviceName: string): boolean;
        /**
         * Returns the service for the given service name (ID) or null if it cannot be found
         *
         * @param serviceName the name of the service to look for
         * @return {null}
         */
        findService(serviceName: string): any;
        /**
         * Returns the service link for the given service name
         *
         * @param serviceName the name of the service
         * @return {null}
         */
        serviceLink(serviceName: string): string;
        /**
         * Returns the service link for the given service name if its ready (has at least one ready pod)
         *
         * @param serviceName the name of the service
         * @return {null}
         */
        serviceReadyLink(serviceName: string): string;
        private getModel();
    }
}
