/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>

module Project {

  export var context = '/project';
  export var hash = '#' + context;
  export var pluginName = 'Project';
  export var log:Logging.Logger = Logger.get(pluginName);

  export var pluginPath = 'plugins/project/';
  export var templatePath = pluginPath + 'html/';


  export var gogsRestURL = "/kubernetes/api/" + Kubernetes.defaultApiVersion + "/proxy/services/gogs-http-service/api/v1";

  export var gogsUserRepoRestURL = gogsRestURL + "/user/repos";

}
