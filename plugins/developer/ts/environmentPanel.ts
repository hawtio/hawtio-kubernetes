/// <reference path="developerPlugin.ts"/>

module Developer {
  _module.controller('Developer.EnvironmentPanelController', ($scope, $element, $location, $routeParams, KubernetesModel:Kubernetes.KubernetesModelService, $http, $timeout, KubernetesState, KubernetesApiURL) => {
    $scope.model = KubernetesModel;
    $scope.$watch('env && entity && envVersions', (newValue, oldValue) => {
      if (newValue !== oldValue && newValue) {
        $scope.env = $scope.$eval('env');
        $scope.buildConfig = $scope.$eval('entity');
        $scope.envVersions = $scope.$eval('envVersions');
        if ($scope.buildConfig) {
          doLoad();
        }
      }
    });
    $scope.open = true;
    $scope.toggle = () => $scope.open = !$scope.open;
    var caches = {};
    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    $scope.environmentLink = (env) => {
      return environmentInstanceLink(env, Kubernetes.getName($scope.buildConfig));
    };
    function doLoad() {
      var projectName = Kubernetes.getName($scope.buildConfig);
      log.info("Loading project versions for project " + projectName);
      loadProjectVersions($scope, $element, $scope.buildConfig, $scope.env, $scope.env.namespace, $scope.envVersions, caches);
    }

  });
}
