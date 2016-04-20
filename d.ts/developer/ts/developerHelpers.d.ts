/// <reference path="../../includes.d.ts" />
declare module Developer {
    var context: string;
    var hash: string;
    var pluginName: string;
    var pluginPath: string;
    var templatePath: string;
    var log: Logging.Logger;
    var jenkinsServiceName: string;
    var jenkinsServiceNameAndPort: string;
    var jenkinsHttpConfig: {
        headers: {
            Accept: string;
        };
    };
    /**
     * Returns true if the value hasn't changed from the last cached JSON version of this object
     */
    function hasObjectChanged(value: any, state: any): boolean;
    function projectForScope($scope: any): any;
    /**
     * Lets load the project versions for the given namespace
     */
    function loadProjectVersions($scope: any, $element: any, project: any, env: any, ns: any, answer: any, caches: any, projectNamespace?: any): void;
}
