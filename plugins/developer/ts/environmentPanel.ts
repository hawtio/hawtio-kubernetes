/// <reference path="developerPlugin.ts"/>

module Developer {
  _module.controller('Developer.EnvironmentPanelController', ($scope, $element, $location, $routeParams, KubernetesModel:Kubernetes.KubernetesModelService, $http, $timeout, KubernetesState, KubernetesApiURL) => {

    $scope.envVersions = {};
    $scope.model = KubernetesModel;

    var caches = {};

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    var namespace = $routeParams['namespace'];
    var projectId = $routeParams['projectId'];
    var label = $routeParams['label'];

    function onBuildConfigs(buildConfigs) {
      _.forEach(buildConfigs, (buildConfig:any) => {
        if (KubernetesAPI.getName(buildConfig) === projectId) {
          var sortedBuilds = null;
          Kubernetes.enrichBuildConfig(buildConfig, sortedBuilds);
          _.forEach(buildConfig.environments, (env:any) => {
            if (label === env.label) {
              loadProjectVersions($scope, $element, buildConfig, env, env.namespace, $scope.envVersions, caches);
              $scope.env = env;
            }
          });
        }
      });
      Core.$apply($scope);
    }

    if (KubernetesModel.buildconfigs) {
      onBuildConfigs(KubernetesModel.buildconfigs);
    }

    $scope.$watch('model.buildconfigs', onBuildConfigs);


  });

}
