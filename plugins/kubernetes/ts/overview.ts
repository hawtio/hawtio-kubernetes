/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  var OverviewDirective = _module.directive("kubernetesOverview", ["$templateCache", "$compile", "$interpolate", "$timeout", "$window", "KubernetesState", 'KubernetesModel', ($templateCache:ng.ITemplateCacheService, $compile:ng.ICompileService, $interpolate:ng.IInterpolateService, $timeout:ng.ITimeoutService, $window:ng.IWindowService, KubernetesState, KubernetesModel) => {
    return {
      restrict: 'E',
      replace: true,
      link: (scope, element, attr) => {
        scope.model = KubernetesModel;
        element.css({visibility: 'hidden'});
        scope.getEntity = (type:string, key:string) => {
          switch (type) {
            case 'host':
              return scope.model.hostsByKey[key];
            case 'pod':
              return scope.model.podsByKey[key];
            case 'replicationController':
              return scope.model.replicationControllersByKey[key];
            case 'service':
              return scope.model.servicesByKey[key];
            default:
              return undefined;

          }
        };

        scope.kubernetes = KubernetesState;

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
          switch (type) {
            case 'pod':
              break;
            case 'service':
              // swap this connection around so the arrow is pointing to the service
              var target = edge.target;
              var source = edge.source;
              edge.target = source;
              edge.source = target;
              params.target = edge.target.el;
              params.source = edge.source.el;
              params.paintStyle = {
                lineWidth: 2,
                strokeStyle: '#5555cc'
              };
              /*
              params.overlays = [
                [ 'PlainArrow', { location: 2, direction: -1, width: 4, length: 4 } ]
              ]
              */
              params.anchors = [
                [ "ContinuousLeft", { } ],
                [ "ContinuousRight", { shape: "Rectangle" } ]
              ];
              break;
            case 'replicationController':
              params.paintStyle = {
                lineWidth: 2,
                dashstyle: '2 2',
                strokeStyle: '#44aa44'
              }
              /*
              params.overlays = [
                [ 'PlainArrow', { location: 1, width: 4, length: 4 } ]
              ]
              */
              params.anchors = [
                [ "Perimeter", { shape: "Circle" } ],
                [ "ContinuousRight", { } ]
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
            var existing = parentEl.find("#" + thing['_key']);
            if (!existing.length) {
              parentEl.append($compile(createElement(template, thingName, thing))(scope));
            }
          });
        }
        function namespaceFilter(item) {
            return item.namespace === scope.kubernetes.selectedNamespace;
        }
        function firstDraw() {
          log.debug("First draw");
          var services = scope.model.services;
          var replicationControllers = scope.model.replicationControllers;
          var pods = scope.model.pods;
          var hosts = scope.model.hosts;
          // log.debug("hosts: ", scope.model.hosts);
          var parentEl = angular.element($templateCache.get("overviewTemplate.html"));
          var servicesEl = parentEl.find(".services");
          var hostsEl = parentEl.find(".hosts");
          var replicationControllersEl = parentEl.find(".replicationControllers");

          servicesEl.append(createElements($templateCache.get("serviceTemplate.html"), 'service', services.filter(namespaceFilter)));
          replicationControllersEl.append(createElements($templateCache.get("replicationControllerTemplate.html"), 'replicationController', replicationControllers.filter(namespaceFilter)));

          hosts.forEach((host) => {
            var hostEl = angular.element(createElement($templateCache.get("hostTemplate.html"), 'host', host));
            var podContainer = angular.element(hostEl.find('.pod-container'));
            podContainer.append(createElements($templateCache.get("podTemplate.html"), "pod", host.pods.filter(namespaceFilter)));
            hostsEl.append(hostEl);
          });
          //parentEl.append(createElements($templateCache.get("podTemplate.html"), 'pod', pods));
          element.append($compile(parentEl)(scope));
          $timeout(() => { element.css({visibility: 'visible'}); }, 250);
        }
        function update() {
          scope.$emit('jsplumbDoWhileSuspended', () => {
            log.debug("Update");
            var services = scope.model.services.filter(namespaceFilter);
            var replicationControllers = scope.model.replicationControllers.filter(namespaceFilter);
            var pods = scope.model.pods.filter(namespaceFilter);
            var hosts = scope.model.hosts;
            var parentEl = element.find('[hawtio-jsplumb]');
            var children = parentEl.find('.jsplumb-node');
            children.each((index, c) => {
              var child = angular.element(c);
              var key = child.attr('id');
              if (Core.isBlank(key)) {
                return;
              }
              var type = child.attr('data-type');
              switch (type) {
                case 'host':
                  if (key in scope.model.hostsByKey) {
                    return;
                  }
                  break;
                case 'service':
                  if (key in scope.model.servicesByKey && scope.model.servicesByKey[key].namespace == scope.kubernetes.selectedNamespace) {
                    var service = scope.model.servicesByKey[key];
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
                  if (key in scope.model.podsByKey && scope.model.podsByKey[key].namespace == scope.kubernetes.selectedNamespace) {
                    return;
                  }
                  break;
                case 'replicationController':
                  if (key in scope.model.replicationControllersByKey && scope.model.replicationControllersByKey[key].namespace == scope.kubernetes.selectedNamespace) {
                    var replicationController = scope.model.replicationControllersByKey[key];
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
            var servicesEl = parentEl.find(".services");
            var hostsEl = parentEl.find(".hosts");
            var replicationControllersEl = parentEl.find(".replicationControllers");
            appendNewElements(servicesEl, $templateCache.get("serviceTemplate.html"), "service", services.filter(namespaceFilter));
            appendNewElements(replicationControllersEl, $templateCache.get("replicationControllerTemplate.html"), "replicationController", replicationControllers.filter(namespaceFilter));
            appendNewElements(hostsEl, $templateCache.get("hostTemplate.html"), "host", hosts);
            hosts.forEach((host) => {
              var hostEl = parentEl.find("#" + host._key);
              appendNewElements(hostEl, $templateCache.get("podTemplate.html"), "pod", host.pods.filter(namespaceFilter));
            });
          });
        }
        function refreshDrawing() {
            if (element.children().length === 0) {
              firstDraw();
            } else {
              update();
            }
          }

        scope.$on('kubernetesModelUpdated', refreshDrawing);

        // detect the view changing after the last time the model changed
        scope.$on("$routeChangeSuccess", () => {
          setTimeout(refreshDrawing, 200);
        });
      }
    };
  }]);

  var OverviewBoxController = controller("OverviewBoxController", ["$scope", "$location", ($scope, $location:ng.ILocationService) => {
    $scope.viewDetails = (path:string) => {
      $location.path(UrlHelpers.join('/kubernetes/namespace', $scope.entity.namespace, path)).search({'_id': $scope.entity.id });
    }
  }]);

  var scopeName = "OverviewController";

  var OverviewController = controller(scopeName, ["$scope", "$location", "KubernetesModel","KubernetesState", ($scope, $location, KubernetesModel, KubernetesState) => {
    $scope.name = scopeName;
    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;

    ControllerHelpers.bindModelToSearchParam($scope, $location, 'kubernetes.selectedNamespace', 'namespace', undefined);

  }]);

}
