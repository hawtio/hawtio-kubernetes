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

    loadProjectVersions($scope, $element, $scope.buildConfig, $scope.env, $scope.env.namespace, $scope.envVersions, caches);

  });
}
