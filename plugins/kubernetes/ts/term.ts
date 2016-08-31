/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="watcher.ts"/>

module Kubernetes {

  var log = Logger.get("kubernetes-term-windows");

  _module.config((kubernetesContainerSocketProvider) => {
    kubernetesContainerSocketProvider.WebSocketFactory = "CustomWebSockets";
  });

  _module.factory('CustomWebSockets', (userDetails:any) => {
    return function CustomWebSocket(url, protocols) {
      if (userDetails.token) {
        var paths = url.split('?');
        if (!_.startsWith(paths[0], masterApiUrl())) {
          paths[0] = UrlHelpers.join(masterApiUrl(), paths[0]);
        }
        url = KubernetesAPI.wsUrl(paths[0]);
        url.search(paths[1] + '&access_token=' + userDetails.token);
        log.debug("Using ws url: ", url.toString());
        return new WebSocket(url.toString(), protocols);
      } else {
        return new WebSocket(url, protocols);
      }
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
    var header = element.find('.terminal-title');
    var body = element.find('.terminal-body');
    element.on('$destroy', () => {
      $('#main').css({ display: 'inherit' });
    });

    var HEIGHT = 348;
    var WIDTH = 600;
    var TITLE_HEIGHT = 35;
    var NAV_OFFSET = 46;

    element.css({
      height: HEIGHT,
      width: WIDTH
    });
    header.css({
      height: TITLE_HEIGHT
    });
    body.css({
      position: 'absolute',
      top: 35,
      left: 0,
      right: 0, 
      bottom: 0
    });
    scope.close = () => {
      TerminalService.closeTerminal(scope.id);
    };
    scope.raise = () => {
      TerminalService.raiseTerminal(scope.id);
    };
    scope.$watch('docked', (docked) => {
      if (docked) {
        element.width(WIDTH);
        if (!element.hasClass('minimized')) {
          element.height(HEIGHT);
        }
      }
    });
    scope.startResize = (e) => {
      e.preventDefault();
      log.debug("Start resize");
      scope.resizing = true;
      element.on('mouseup', scope.stopResize);
      $(document).on('mousemove', scope.doResize);
      $(document).on('mouseleave', scope.stopResize);
    };
    scope.doResize = (e) => {
      if (scope.resizing) {
        log.debug("Resizing, e: ", e);
        if (!moved) {
          lastX = e.clientX;
          lastY = e.clientY;
          moved = true;
          return;
        }
        var height = element.height();
        var width = element.width();
        var deltaX = e.clientX - lastX;
        var deltaY = e.clientY - lastY;
        var newHeight = height + deltaY;
        var newWidth = width + deltaX;
        if (newHeight > 35 && newWidth > 80) {
          element.height(height + deltaY);
          element.width(width + deltaX);
        }
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };
    scope.stopResize = (e) => {
      scope.resizing = false;
      moved = false;
      element.off('mouseup', scope.stopResize);
      $(document).off('mousemove', scope.doResize);
      $(document).off('mouseleave', scope.stopResize);
    }
    scope.mouseDown = (e) => {
      e.preventDefault();
      if (element.hasClass('minimized') || element.hasClass('maximized')) {
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

    function restoreWindow(scope, element) {
      if (scope.offset) {
        element.offset(scope.offset);
        scope.docked = false;
      }
      if (scope.height) {
        element.height(scope.height);
      }
      if (scope.width) {
        element.width(scope.width);
      }
    }

    function saveWindow(scope, element) {
      scope.offset = element.offset();
      scope.height = element.height();
      scope.width = element.width();
    }

    scope.maximized = () => {
      return element.hasClass('maximized');
    }

    scope.maximize = ($e) => {
      $e.preventDefault();
      if (element.hasClass('minimized')) {
        scope.minimize();
      }
      if (element.hasClass('maximized')) {
        restoreWindow(scope, element);
        $('#main').css({ display: 'inherit' });
      } else {
        saveWindow(scope, element);
        $('#main').css({ display: 'none' });
        element.css({ 
          height: 'inherit', 
          bottom: 0, 
          width: '100%', 
          top: NAV_OFFSET, 
          left: 0 
        });
      }
      element.toggleClass('maximized');
    }
    scope.minimize = ($e) => {
      $e.preventDefault();
      if (element.hasClass('maximized')) {
        scope.maximize();
      }
      if (element.hasClass('minimized')) {
        restoreWindow(scope, element);
      } else {
        saveWindow(scope, element);
        scope.docked = true;
        element.css({ height: TITLE_HEIGHT, top: "inherit", left: "inherit" });
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

