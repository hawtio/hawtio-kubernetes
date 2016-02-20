/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="watcher.ts"/>

module Kubernetes {

  var log = Logger.get("kubernetes-term-windows");

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
        if (!value.scope.docked) {
          return;
        }
        value.el.css('left', position + 'px');
        position = position + dist;
      });
    }
    var defaultTemplate = $templateCache.get(UrlHelpers.join(templatePath, 'termShell.html'));
    var self = {
      positionTerminals: () => {
        positionTerminals(self.terminals);
      },
      terminals: {},
      newTerminal: (podLink, containerName, template = defaultTemplate) => {
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
        scope.docked = true;
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

  export function addWindowActions(scope, element, TerminalService) {
    var moved = false;
    var lastX = 0;
    var lastY = 0;
    scope.close = () => {
      TerminalService.closeTerminal(scope.id);
    };
    scope.raise = () => {
      TerminalService.raiseTerminal(scope.id);
    }
    scope.mouseDown = (e) => {
      e.preventDefault();
      if (element.hasClass('minimized')) {
        return;
      }
      scope.dragging = true;
      element.on('mouseup', scope.mouseUp);
      $(document).on('mousemove', scope.mouseMove);
      $(document).on('mouseleave', scope.mouseUp);
    };
    scope.mouseUp = (e) => {
      e.preventDefault();
      scope.dragging = false;
      moved = false;

      var height = element.height();
      var offset = element.offset();
      var winHeight = $(window).height();
      if (offset.top > (winHeight - height - 20)) {
        element.css({ top: "inherit", left: "inherit" });
        scope.docked = true;
        TerminalService.positionTerminals();
      } else {
        scope.docked = false;
      }
      element.off('mouseup', scope.mouseUp);
      $(document).off('mousemove', scope.mouseMove);
      $(document).off('mouseleave', scope.mouseUp);
    };
    scope.mouseMove = (e) => {
      if (scope.dragging) {
        if (!moved) {
          lastX = e.clientX;
          lastY = e.clientY;
          moved = true;
          return;
        }
        var deltaX = e.clientX - lastX;
        var deltaY = e.clientY - lastY;
        var elOffset = element.offset();
        element.offset({ top: elOffset.top + deltaY, left: elOffset.left + deltaX });
        lastX = e.clientX;
        lastY = e.clientY;
      }
    }
    scope.minimize = () => {
      if (element.hasClass('minimized')) {
        if (scope.offset) {
          element.offset(scope.offset);
          scope.docked = false;
        }
      } else {
        scope.offset = element.offset();
        scope.docked = true;
        element.css({ top: "inherit", left: "inherit" });
        TerminalService.positionTerminals();
      }
      element.toggleClass('minimized');
    };
  }

  _module.directive('terminalWindow', ($compile, TerminalService) => {
    return {
      restrict: 'A',
      scope: false,
      link: (scope:any, element, attr) => {
        addWindowActions(scope, element, TerminalService);
        var body = element.find('.terminal-body');
        body.append($compile('<kubernetes-container-terminal pod="podLink" container="containerName" command="bash"></kubernetes-container-terminal>')(scope));
      }
    };
  });
}

