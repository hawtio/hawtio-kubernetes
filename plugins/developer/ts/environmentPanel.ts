/// <reference path="developerPlugin.ts"/>

module Developer {
  _module.controller('Developer.EnvironmentPanelController', ($scope, $element, $location, $routeParams, KubernetesModel:Kubernetes.KubernetesModelService, $http, $timeout, KubernetesState, KubernetesApiURL) => {

    $scope.envVersions = {};
    $scope.model = KubernetesModel;
    $scope.env = $scope.$eval('env');
    $scope.buildConfig = $scope.$eval('entity');

    $scope.open = true;

    $scope.toggle = () => $scope.open = !$scope.open;

    var caches = {};

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    $scope.environmentLink = (env) => {
      var projectName = Kubernetes.getName($scope.buildConfig);
      if (projectName && env) {
        var envNamespace = env["namespace"];
        return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", Kubernetes.currentKubernetesNamespace(), "projects", projectName, "namespace", envNamespace);
      }
      return "";
    };

    var loaded = false;

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
