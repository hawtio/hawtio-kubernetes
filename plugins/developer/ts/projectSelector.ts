/// <reference path="developerPlugin.ts"/>

module Developer {

  _module.controller('Developer.ProjectSelector', ['$scope', '$routeParams', 'KubernetesModel', ($scope, $routeParams, KubernetesModel) => {
    var projectId = $routeParams['projectId'] || $routeParams['project'] || $routeParams['id'];
    if (projectId) {
      $scope.projectId = projectId;
      $scope.model = KubernetesModel
      $scope.$watch('model.buildconfigs', (buildconfigs) => {
        $scope.projects = buildconfigs;
      });
    } else {
      log.info("no project ID in routeParams: ", $routeParams);
    }
  }]);

}

