/// <reference path="../../includes.d.ts" />
declare module Kubernetes {
    /**
     * Sorts the the ip field
     *
     * @param ip the ip such as '10.1.2.13'
     * @returns {any}
     */
    function sortByPodIp(ip: any): any;
}
