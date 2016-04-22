/// <reference path="developerPlugin.ts"/>

module Developer {
  _module.controller('Developer.EnvironmentPanelController', ($scope, $element, $location, $routeParams, KubernetesModel:Kubernetes.KubernetesModelService, $http, $timeout, KubernetesState, KubernetesApiURL) => {
    $scope.model = KubernetesModel;
    $scope.env = $scope.$eval('env');
    $scope.buildConfig = $scope.$eval('entity');

    var loaded = false;
    $scope.envVersions = $scope.$eval('envVersions');
    if ($scope.envVersions) {
      loaded = true;
    } else {
      $scope.envVersions = {};
    }

    $scope.open = true;

    $scope.toggle = () => $scope.open = !$scope.open;

    var caches = {};

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    $scope.environmentLink = (env) => {
      return environmentInstanceLink(env, Kubernetes.getName($scope.buildConfig));
    };

    function doLoad() {
      if (!loaded) {
        var projectName = Kubernetes.getName($scope.buildConfig);
        log.info("Loading project versions for project " + projectName);
        loadProjectVersions($scope, $element, $scope.buildConfig, $scope.env, $scope.env.namespace, $scope.envVersions, caches);
        loaded = true;
      }
    }

    if ($scope.buildConfig) {
      doLoad();
    } else {
      $scope.$watch("entity", () => {
        var entity = $scope.$eval('entity');
        if (entity) {
          $scope.buildConfig = entity;
          doLoad();
        }
      });
    }
  });
}
