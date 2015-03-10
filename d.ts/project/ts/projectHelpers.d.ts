/// <reference path="../../includes.d.ts" />
/// <reference path="../../kubernetes/ts/kubernetesHelpers.d.ts" />
declare module Project {
    var context: string;
    var hash: string;
    var pluginName: string;
    var log: Logging.Logger;
    var pluginPath: string;
    var templatePath: string;
    var gogsRestURL: string;
    var gogsUserRepoRestURL: string;
}
