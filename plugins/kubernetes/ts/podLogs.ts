/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  var log = Logger.get("kubernetes-pod-logs");

  _module.controller("Kubernetes.PodLogLinkController", ($scope, TerminalService, $templateCache) => {

    $scope.openLogs = (entity) => {
      log.debug("Open logs: ", entity);
      TerminalService.newTerminal(entity.metadata.selfLink, entity.metadata.name, $templateCache.get(UrlHelpers.join(templatePath, 'logShell.html')));
    }

  });

  _module.directive('podLogDisplay', (userDetails) => {
    return {
      restrict: 'E',
      template: `
        <div class="pod-log-viewport" scroll-glue>
          <div class="pod-log-lines">
            <p ng-repeat="message in messages track by $index">{{message}}</p>
          </div>
        </div>
      `,
      link: (scope:any, element, attr) => {
        var link = scope.$eval('podLink');
        var name = scope.$eval('containerName');

        if (!link) {
          return;
        }

        scope.messages = [];

        link = UrlHelpers.join(masterApiUrl(), link, 'log');
        link = KubernetesAPI.wsUrl(link);
        link.search({
          follow: true,
          tailLines: 1000,
          access_token: userDetails.token
        });

        log.debug("log display, link: ", link.toString(), " name: ", name);
        // var out = element.find('.pod-log-lines');

        var messages = [];

        var pullMessages = _.debounce(() => {
          scope.messages = scope.messages.concat(_.remove(messages, () => true));
          Core.$apply(scope);
        }, 1000);

        var ws = new WebSocket(link.toString(), 'base64.binary.k8s.io');
        ws.onmessage = (event) => {
          try {
            var message = window.atob(event.data);
            messages.push(message);
            pullMessages();
          } catch (err) {
            // we'll just ignore these
            //log.debug("Failed to decode message: ", event.data, " error: ", err);
          }
        }

        element.on('$destroy', () => {
          if (ws) {
            try {
              ws.close();
            } catch (err) {
              // nothing to do
            }
            delete ws;
          }
        });
      }
    }
  });

  _module.directive('podLogWindow', ($compile, TerminalService) => {
    return {
      restrict: 'A',
      scope: false,
      link: (scope:any, element, attr) => {
        scope.close = () => {
          TerminalService.closeTerminal(scope.id);
        };
        scope.raise = () => {
          TerminalService.raiseTerminal(scope.id);
        };
        scope.minimize = () => {
          element.toggleClass('minimized');
        }
      }
    };
  });

}
