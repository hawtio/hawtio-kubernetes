/// <reference path="developerPlugin.ts"/>

module Developer {

  _module.controller('Developer.ProjectSelector', ['$scope', '$routeParams', 'KubernetesModel', ($scope, $routeParams, KubernetesModel) => {

    log.info("routeParams: ", $routeParams);

    var projectId = $routeParams['id'] || $routeParams['projectId'];
    if (projectId) {
      $scope.projectId = projectId;
      $scope.model = KubernetesModel
      $scope.$watch('model.buildconfigs', (buildconfigs) => {
        $scope.projects = buildconfigs;
        log.info('projects: ', $scope.projects);
      });
    }

    log.info("projectId: ", projectId);

  }]);

}

