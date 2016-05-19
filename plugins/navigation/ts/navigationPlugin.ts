/// <reference path="../../includes.ts"/>
module Navigation {

  export var pluginName = 'hawtio-navigation';
  export var log = Logger.get(pluginName);
  export var _module = angular.module(pluginName, []);

  _module.run(() => {
  });

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

  _module.directive('hawtioRelativeHref', ['$location', ($location) => {
    return {
      restrict: 'A',
      link: (scope, element, attr) => {
        var targetPath = attr['hawtioRelativeHref'];
        var targetHref = new URI($location.url());
        targetHref.segment(targetPath);
        element.attr('href', targetHref.toString());
      }
    }
  }]);

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
        scope.tabs = HawtioSubTabs;
        scope.$watchCollection('tabs.get()', (tabs) => {
          // log.debug("subTabConfig: ", subTabConfig);
          if (tabs && tabs.length > 0) {
            element.removeClass('hidden-nav');
            //element.css({ 'margin-left': '' });
          } else {
            element.addClass('hidden-nav');
            //element.css({ 'margin-left': 'auto' });
          }
        });
      }
    };

  }]);

  _module.directive('hawtioTabsOutlet', ['HawtioSubTabs', (HawtioSubTabs) => {
    var initialized = false;
    return {
      restrict: 'AE',
      replace: true,
      template: `
        <div class="nav-pf-vertical nav-pf-vertical-with-secondary-nav" ng-controller="Developer.NavBarController" ng-class="getClass()">
          <ul class="list-group">
            <li ng-repeat="subTab in subTabConfig" ng-show="isValid(subTab)"
                class="list-group-item {{subTab.active ? 'active' : ''}}"
                title="{{subTab.title}}">
                <a ng-hide="subTab.template" href="{{subTab.href}}">
                  <span ng-show="subTab.class" ng-class="subTab.class"></span>
                  <img ng-show="subTab.icon" ng-src="{{subTab.icon}}">
                  {{subTab.label}}
                </a>
                <div ng-show="subTab.template" compile="subTab.template"></div>
            </li>
          </ul>
        </div>
      `,
      link: (scope, element, attrs) => {
        if (!initialized) {
          try {
            (<any>$)().setupVerticalNavigation(false);
          } catch (err) {
            // ignore if we haven't loaded patternfly
          }
          initialized = true;
        }
        scope.HawtioSubTabs = HawtioSubTabs;
        var collapsed = false;
        scope.getClass = () => {
          //log.debug("My class: ", element.attr('class'));
          if (!scope.subTabConfig || !scope.subTabConfig.length) {
            return 'hidden';
          }
          if (collapsed) {
            return 'collapsed';
          }
          return '';
        }
        scope.$on('hawtioCollapseNav', () => {
          collapsed = !collapsed;
        });
        scope.$watch('HawtioSubTabs.get()', (subTabConfig) => {
          scope.subTabConfig = subTabConfig;
        });
      }
    };
  }]);

  _module.directive('hawtioBreadcrumbsOutlet', ['HawtioBreadcrumbs', 'HawtioSubTabs', (HawtioBreadcrumbs, HawtioSubTabs) => {
    return {
      restrict: 'E',
      scope: {},
      template: `
        <div class="nav navbar-nav nav-breadcrumb" ng-show="breadcrumbConfig" ng-controller="Developer.NavBarController">
          <ol class="breadcrumb">
            <li ng-repeat="breadcrumb in breadcrumbConfig" ng-show="isValid(breadcrumb) && label(breadcrumb)"
                class="{{breadcrumb.active ? 'active' : ''}}"
                ng-class="$last ? 'dropdown' : ''"
                title="{{breadcrumb.title}}">
              <a ng-show="breadcrumb.href" href="{{breadcrumb.href}}">{{label(breadcrumb)}}</a>
              <span ng-hide="breadcrumb.href">{{label(breadcrumb)}}</span>
            </li>
            <li ng-show="pageTitle">
              <span ng-bind="pageTitle"></span>
            </li>
          </ol>
        </div>
      `,
      link: (scope, element, attrs) => {
        scope.breadcrumbs = HawtioBreadcrumbs;
        scope.tabs = HawtioSubTabs;
        scope.$watchCollection('breadcrumbs.get()', (breadcrumbConfig) => {
          scope.breadcrumbConfig = breadcrumbConfig;
        });
        scope.$watchCollection('tabs.get()', (tabs) => {
          var active = _.find(tabs, (tab:any) => tab.active);
          if (active) {
            scope.pageTitle = active.label;
          } else {
            scope.pageTitle = undefined;
          }
        });
      }
    };
  }]);

  //hawtioPluginLoader.addModule('patternfly');
  hawtioPluginLoader.addModule(pluginName);

}

