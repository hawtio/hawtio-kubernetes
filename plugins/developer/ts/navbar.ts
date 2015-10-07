/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  export var NavBarController = controller("NavBarController",
    ["$scope", "$location", "$routeParams", "$timeout", "KubernetesApiURL",
      ($scope, $location:ng.ILocationService, $routeParams, $timeout) => {

        $scope.isValid = (item) => {
          if (item) {
            var value = item.isValid;
            if (angular.isFunction(value)) {
              return value(item)
            } else {
              return angular.isUndefined(value) || value;
            }
            return true;
          }
          return false;
        }
      }]);
}
