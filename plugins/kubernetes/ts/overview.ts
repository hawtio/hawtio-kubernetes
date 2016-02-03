/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  var OverviewDirective = _module.directive("kubernetesOverview", ["$templateCache", "$compile", "$interpolate", "$timeout", "$window", "KubernetesState", 'KubernetesModel', ($templateCache:ng.ITemplateCacheService, $compile:ng.ICompileService, $interpolate:ng.IInterpolateService, $timeout:ng.ITimeoutService, $window:ng.IWindowService, KubernetesState, KubernetesModel) => {

    var log = Logger.get('kubernetes-overview');
    var model = KubernetesModel;
    var state = KubernetesState;

    return {
      restrict: 'E',
      replace: true,
      link: (scope, element, attr) => {
        scope.model = model;
        element.css({visibility: 'hidden'});
        scope.getEntity = (type:string, key:string) => {
          switch (type) {
            case 'host':
              return model.podsByHost[key];
            case 'pod':
              return model.podsByKey[key];
            case 'replicationController':
              return model.replicationControllersByKey[key];
            case 'service':
              return model.servicesByKey[key];
            default:
              return undefined;
          }
        };

        scope.kubernetes = state;

        scope.customizeDefaultOptions = (options) => {
          options.Endpoint = ['Blank', {}];
        };
        scope.mouseEnter = ($event) => {
          if (scope.jsPlumb) {
            angular.element($event.currentTarget).addClass("hovered");
            scope.jsPlumb.getEndpoints($event.currentTarget).forEach((endpoint) => {
              endpoint.connections.forEach((connection) => {
                if (!connection.isHover()) {
                  connection.setHover(true);
                  connection.endpoints.forEach((e) => {
                    scope.mouseEnter({
                      currentTarget: e.element
                    });
                  });
                }
              });
            });
          }
        }
        scope.mouseLeave = ($event) => {
          if (scope.jsPlumb) {
            angular.element($event.currentTarget).removeClass("hovered");
            scope.jsPlumb.getEndpoints($event.currentTarget).forEach((endpoint) => {
              endpoint.connections.forEach((connection) => {
                if (connection.isHover()) {
                  connection.setHover(false);
                  connection.endpoints.forEach((e) => {
                    scope.mouseLeave({
                      currentTarget: e.element
                    });
                  });
                }
              });
            });
          }
        }
        /*
        scope.customizeEndpointOptions = (jsPlumb, node, options) => {
          var type = node.el.attr('data-type');
          // log.debug("endpoint type: ", type);
          switch (type) {
            case 'pod':
              break;
            case 'service':
              break;
            case 'replicationController':
              break;
          }
        };
        */
        scope.customizeConnectionOptions = (jsPlumb, edge, params, options) => {
          var type = edge.source.el.attr('data-type');
          options.connector = [ "Bezier", { curviness: 50, stub: 25, alwaysRespectStubs: true } ];
          params.paintStyle = {
            lineWidth: 2,
            strokeStyle: '#5555cc'
          };
          switch (type) {
            case 'pod':
              break;
            case 'service':
              params.anchors = [
                [ "Continuous", { faces: ["right"] } ],
                [ "Continuous", { faces: ["left"] } ] 
                /*
                [1, 0.5, 0, 0, -10, -90],
                [0, 0.5, 0, 0, -10, -90]
                */
              ];
              break;
            case 'replicationController':
              params.anchors = [
                [ "Perimeter", { shape: "Circle" } ],
                [ "Continuous", { faces: ["right"] } ]
                /*
                [0, 0.5, 0, 0, -10, -90],
                [1, 0.5, 0, 0, -10, -90]
                */
              ];
              break;
          }
          //log.debug("connection source type: ", type);
          return options;
        };
        function interpolate(template, config) {
          return $interpolate(template)(config);
        }
        function createElement(template, thingName, thing) {
          var config = {};
          config[thingName] = thing;
          return interpolate(template, config);
        }
        function createElements(template, thingName, things) {
          return things.map((thing) => {
            return createElement(template, thingName, thing);
          });
        }
        function appendNewElements(parentEl, template, thingName, things) {
          things.forEach((thing) => {
            var key = thing['_key'] || thing['elementId'] || thing['id']
            var existing = parentEl.find("#" + key );
            if (!existing.length) {
              log.debug("existing: ", existing, " key: ", key);
              parentEl.append($compile(createElement(template, thingName, thing))(scope));
            }
          });
        }
        function namespaceFilter(item) {
            return getNamespace(item) === scope.kubernetes.selectedNamespace;
        }
        function firstDraw() {
          log.debug("First draw");
          element.empty();
          var services = model.services;
          var replicationControllers = model.replicationControllers;
          var pods = model.pods;
          var hosts = model.hosts;
          // log.debug("hosts: ", model.hosts);
          var parentEl = angular.element($templateCache.get("overviewTemplate.html"));
          var servicesEl = parentEl.find(".services");
          var hostsEl = parentEl.find(".hosts");
          var replicationControllersEl = parentEl.find(".replicationControllers");

          servicesEl.append(createElements($templateCache.get("serviceTemplate.html"), 'service', services.filter(namespaceFilter)));
          replicationControllersEl.append(createElements($templateCache.get("replicationControllerTemplate.html"), 'replicationController', replicationControllers.filter(namespaceFilter)));

          hosts.forEach((host) => {
            var hostEl = angular.element(createElement($templateCache.get("overviewHostTemplate.html"), 'host', host));
            var podContainer = angular.element(hostEl.find('.pod-container'));
            podContainer.append(createElements($templateCache.get("podTemplate.html"), "pod", host.pods));
            hostsEl.append(hostEl);
          });
          //parentEl.append(createElements($templateCache.get("podTemplate.html"), 'pod', pods));
          element.append($compile(parentEl)(scope));
          $timeout(() => { element.css({visibility: 'visible'}); }, 250);
        }

        function update() {
          scope.$emit('jsplumbDoWhileSuspended', () => {
            log.debug("Update");
            var services = model.services;
            var replicationControllers = model.replicationControllers;
            var pods = model.pods;
            var hosts = model.hosts;
            var parentEl = element.find('[hawtio-jsplumb]');
            var children = parentEl.find('.jsplumb-node');
            children.each((index, c) => {
              var child = angular.element(c);
              var key = child.attr('id');
              log.debug('key: ', key);
              if (Core.isBlank(key)) {
                return;
              }
              var type = child.attr('data-type');
              switch (type) {
                case 'host':
                  if (key in model.podsByHost) {
                    return;
                  }
                  break;
                case 'service':
                  if (key in model.servicesByKey && getNamespace(model.servicesByKey[key]) == scope.kubernetes.selectedNamespace) {
                    var service = model.servicesByKey[key];
                    child.attr('connect-to', service.connectTo);
                    return;
                  }
                  break;
                case 'pod':
                  /*
                  if (hasId(pods, id)) {
                    return;
                  }
                  */
                  if (key in model.podsByKey) {
                    return;
                  }
                  break;
                case 'replicationController':
                  if (key in model.replicationControllersByKey) {
                    var replicationController = model.replicationControllersByKey[key];
                    child.attr('connect-to', replicationController.connectTo);
                    return;
                  }
                  break;
                default:
                  log.debug("Ignoring element with unknown type");
                  return;
              }
              log.debug("Removing: ", key);
              child.remove();
            });
            var servicesEl = element.find(".services");
            var replicationControllersEl = element.find(".replicationControllers");
            var hostsEl = element.find(".hosts");

            appendNewElements(servicesEl, $templateCache.get("serviceTemplate.html"), "service", services);
            appendNewElements(replicationControllersEl, $templateCache.get("replicationControllerTemplate.html"), "replicationController", replicationControllers);
            appendNewElements(hostsEl, $templateCache.get("overviewHostTemplate.html"), "host", hosts);
            hosts.forEach((host) => {
              var hostEl = angular.element(hostsEl.find("#" + host.elementId));
              var podContainer = angular.element(hostEl.find('.pod-container'));
              appendNewElements(podContainer, $templateCache.get("podTemplate.html"), "pod", host.pods);
            });
          });
        }

        function refreshDrawing() {
          log.debug("Refreshing drawing");
          if (element.children().length === 0) {
            firstDraw();
          } else {
            update();
          }
          Core.$apply(scope);
        }

        scope.$on('kubernetesModelUpdated', _.debounce(refreshDrawing, 500, { trailing: true}));
        setTimeout(refreshDrawing, 100);
      }
    };
  }]);

  var OverviewBoxController = controller("OverviewBoxController", ["$scope", "$location", ($scope, $location:ng.ILocationService) => {
    $scope.viewDetails = (entity, path:string) => {
      if (entity) {
        var namespace = getNamespace(entity);
        var id = getName(entity);
        $location.path(UrlHelpers.join('/kubernetes/namespace', namespace, path, id));
      } else {
        log.warn("No entity for viewDetails!");
      }
    }
  }]);

  var scopeName = "OverviewController";

  var OverviewController = controller(scopeName, ["$scope", "$location", "$http", "$timeout", "$routeParams", "KubernetesModel","KubernetesState", "KubernetesApiURL", ($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL) => {
    $scope.name = scopeName;
    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    //$scope.subTabConfig = [];
  }]);

}
