/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
module Kubernetes {

  export function selectSubNavBar($scope, tabName, newSubTabLabel) {
    var foundTab = null;
    angular.forEach($scope.subTabConfig, (tab) => {
      if (tabName === tab.label || tabName === tab.id) {
        foundTab = tab;
      }
    });
    var breadcrumbConfig = $scope.breadcrumbConfig;
    if (foundTab && breadcrumbConfig) {
      breadcrumbConfig.push(foundTab);
      $scope.subTabConfig = [
        {
          label: newSubTabLabel
        }
      ];
    }

  }

}
