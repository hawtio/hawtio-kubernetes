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

  /**
   * Navigates to the given path. If the path starts with the HawtioCore.documentBase() then its stripped off the front
   * so that the navigation works properly on vanilla kubernetes
   */
  export function goToPath($location, path) {
    var answer = path;
    var prefix = HawtioCore.documentBase();
    log.debug("HawtioCore.documentBase(): " + prefix);
    log.debug("newPath: " + path);
    if (prefix && path) {
      if (_.startsWith(path, prefix)) {
        var relativePath = Core.trimLeading(path, prefix);
        if (relativePath) {
          answer = relativePath;
        }
      } else {
        log.debug("path " + path + " does not start with documentBase(): " + prefix);
      }
    }
    log.info("Navigating to the relative path: " + answer);
    return $location.path(answer);
  }


}
