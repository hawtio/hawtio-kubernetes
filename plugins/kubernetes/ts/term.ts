/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="watcher.ts"/>

module Kubernetes {
  _module.config((kubernetesContainerSocketProvider) => {
    kubernetesContainerSocketProvider.WebSocketFactory = "CustomWebSockets";
  });

  _module.factory('CustomWebSockets', (userDetails:any) => {
    return function CustomWebSocket(url, protocols) {
      var paths = url.split('?');
      if (!_.startsWith(paths[0], masterApiUrl())) {
        paths[0] = UrlHelpers.join(masterApiUrl(), paths[0]);
      }
      url = KubernetesAPI.wsUrl(paths[0]);
      url.search(paths[1] + '&access_token=' + userDetails.token);
      log.debug("Using ws url: ", url.toString());
      return new WebSocket(url.toString(), protocols);
    };
  });

  _module.service('TerminalService', ($rootScope, $document, $compile, $templateCache) => {
    var body = $document.find('body');
    function positionTerminals(terminals) {
      var total = _.keys(terminals).length;
      var dist = (body.width() - 225) / total;
      var position = 5;
      angular.forEach(terminals, (value, key) => {
        value.el.css('left', position + 'px');
        position = position + dist;
      });
    }
    var self = {
      terminals: {},
      newTerminal: (podLink, containerName) => {
        var terminalId = UrlHelpers.join(podLink, containerName);
        if (terminalId in self.terminals) {
          log.debug("Already a terminal with id: ", terminalId);
          self.raiseTerminal(terminalId);
          return terminalId;
        }
        var scope = $rootScope.$new();
        scope.podLink = podLink;
        scope.containerName = containerName;
        scope.id = terminalId;
        var template = $templateCache.get(UrlHelpers.join(templatePath, 'termShell.html'));
        var el = $($compile(template)(scope));
        var term = {
          scope: scope,
          el: el
        };
        body.append(el);
        self.terminals[terminalId] = term;
        positionTerminals(self.terminals);
        return terminalId;
      },
      closeTerminal: (id) => {
        var term = self.terminals[id];
        if (term) {
          term.el.remove();
          delete self.terminals[id];
          positionTerminals(self.terminals);
        }
      },
      raiseTerminal: (id) => {
        angular.forEach(self.terminals, (value, key) => {
          if (key === id) {
            value.el.css('z-index', '4000');
            value.el.find('.terminal').focus();
          } else {
            value.el.css('z-index', '3000');
          }
        });
      }
    };
    return self;
  });

  _module.directive('terminalWindow', ($compile, TerminalService) => {
    return {
      restrict: 'A',
      scope: false,
      link: (scope, element, attr) => {
        scope.close = () => {
          TerminalService.closeTerminal(scope.id);
        };
        scope.raise = () => {
          TerminalService.raiseTerminal(scope.id);
        };
        scope.minimize = () => {
          element.toggleClass('minimized');
        }
        log.debug("element: ", element);
        var body = element.find('.terminal-body');
        log.debug("body: ", body);
        body.append($compile('<kubernetes-container-terminal pod="podLink" container="containerName" command="bash"></kubernetes-container-terminal>')(scope));
      }
    };
  });
}

