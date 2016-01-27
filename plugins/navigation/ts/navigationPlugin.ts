/// <reference path="../../includes.ts"/>
module Navigation {

  export var pluginName = 'hawtio-navigation';
  export var log = Logger.get(pluginName);
  export var _module = angular.module(pluginName, []);

  _module.service('HawtioBreadcrumbs', () => {
    var _config = [];
    var self = {
      apply: (config) => {
        _config.length = 0;
        _.forEach(config, (crumb) => {
          _config.push(crumb);
        });
      },
      get: () => {
        return _config;
      }
    };
    return self;
  });

  _module.service('HawtioSubTabs', () => {
    var _config = [];
    var self = {
      apply: (config) => {
        _config.length = 0;
        _.forEach(config, (crumb) => {
          _config.push(crumb);
        });
      },
      get: () => {
        return _config;
      } 
    } 
    return self;
  });

  _module.directive('viewportHeight', ['$window', '$document', ($window, $document) => {
    return {
      restrict: 'A',
      link: (scope, element, attr) => {
        // log.debug("Window: ", $window);
        // log.debug("element: ", element);
        var win = $($window);
        var resizeFunc = () => {
          var viewportHeight = win.innerHeight();
          // log.debug("Viewport height: ", viewportHeight);
          var elTop = element.offset().top;
          // log.debug("Element top: ", elTop);
          var height = viewportHeight - elTop;
          element.css('height', height);
        };
        win.on('resize', resizeFunc);
        element.on('$destroy', () => {
          win.off('resize', resizeFunc);
        });
        setTimeout(resizeFunc, 50);
      }
    }
  }]);

  _module.directive('hawtioMainOutlet', ['HawtioSubTabs', (HawtioSubTabs) => {
    return {
      restrict: 'A',
      link: (scope, element, attrs) => {
        scope.HawtioSubTabs = HawtioSubTabs;
        scope.$watchCollection('HawtioSubTabs.get()', (subTabConfig) => {
          // log.debug("subTabConfig: ", subTabConfig);
          if (subTabConfig && subTabConfig.length > 0) {
            element.attr('class', 'col-sm-9 col-md-10 col-sm-push-1 col-md-push-2');
          } else {
            element.attr('class', 'col-md-12');
          }
        });
      }
    };

  }]);

  _module.directive('hawtioTabsOutlet', ['HawtioSubTabs', (HawtioSubTabs) => {
    return {
      restrict: 'E',
      replace: true,
      template: `
        <div ng-show="subTabConfig && subTabConfig.length" class="col-sm-3 col-md-2 col-sm-pull-9 col-md-pull-10 sidebar-pf sidebar-pf-left" viewport-height style="position: fixed;"
             ng-controller="Developer.NavBarController">
          <ul class="nav nav-pills nav-stacked">
            <li ng-repeat="subTab in subTabConfig" ng-show="isValid(subTab)"
                class="{{subTab.active ? 'active' : ''}}"
                title="{{subTab.title}}">
                <a ng-hide="subTab.template" href="{{subTab.href}}">
                  <i ng-show="subTab.class" ng-class="subTab.class"></i>
                  <img ng-show="subTab.icon" ng-src="{{subTab.icon}}" style="max-width: 16px; margin-right: 5px;">
                  {{subTab.label}}
                </a>
                <div ng-show="subTab.template" compile="subTab.template"></div>
            </li>
          </ul>
          <!--

        <div class="pull-right inline-block"
                ng-show="model.serviceApps && model.serviceApps.length"
                ng-include="'plugins/kubernetes/html/serviceApps.html'"></div>
                -->
        </div>
      `,
      link: (scope, element, attrs) => {
        scope.HawtioSubTabs = HawtioSubTabs;
        scope.$watch('HawtioSubTabs.get()', (subTabConfig) => {
          scope.subTabConfig = subTabConfig;
        });
      }
    };
  }]);

  _module.directive('hawtioBreadcrumbsOutlet', ['HawtioBreadcrumbs', (HawtioBreadcrumbs) => {
    return {
      restrict: 'E',
      scope: {},
      template: `
        <div ng-show="breadcrumbConfig" ng-controller="Developer.NavBarController">
          <ol class="breadcrumb">
            <li ng-repeat="breadcrumb in breadcrumbConfig" ng-show="isValid(breadcrumb)"
                class="{{breadcrumb.active ? 'active' : ''}}"
                title="{{breadcrumb.title}}">
              <a ng-show="breadcrumb.href && !breadcrumb.active" href="{{breadcrumb.href}}">{{breadcrumb.label}}</a>
              <span ng-hide="breadcrumb.href && !breadcrumb.active">{{breadcrumb.label}}</span>
          </ol>
        </div>
      `,
      link: (scope, element, attrs) => {
        scope.breadcrumbs = HawtioBreadcrumbs;
        scope.$watchCollection('breadcrumbs.get()', (breadcrumbConfig) => {
          scope.breadcrumbConfig = breadcrumbConfig;
        });
      }
    };
  }]);

  hawtioPluginLoader.addModule('patternfly');
  hawtioPluginLoader.addModule(pluginName);

}

