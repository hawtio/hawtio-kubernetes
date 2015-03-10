/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="projectHelpers.ts"/>

module Project {

  export var _module = angular.module(pluginName, [Kubernetes.pluginName]);
  export var controller = PluginHelpers.createControllerFunction(_module, pluginName);
  export var route = PluginHelpers.createRoutingFunction(templatePath);

  _module.config(['$routeProvider', ($routeProvider:ng.route.IRouteProvider) => {
    $routeProvider.when(UrlHelpers.join(context, '/create'), route('projectCreate.html', false));
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
