/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="term.ts"/>

module Kubernetes {

  var log = Logger.get("kubernetes-pod-logs");

  _module.service("PodLogReplacements", () => {
    return [];
  });

  _module.run((PodLogReplacements) => {
    var log = Logger.get("pod-log-replacers");
    // Add ANSI escape character replacer
    // adapted from https://github.com/mmalecki/ansispan
    var colors = {
      '30': 'black',
      '31': 'red',
      '32': 'green',
      '33': 'yellow',
      '34': 'blue',
      '35': 'purple',
      '36': 'cyan',
      '37': 'white' 
    }
    PodLogReplacements.push((msg) => {
      if (!msg) {
        return msg;
      }
      var end = "</span>";
      _.forOwn(colors, (color, code) => {
        var start = `<span class="` + color + `">`;
        msg = msg.replace(new RegExp('\033\\[' + code + 'm', 'g'), start)
        msg = msg.replace(new RegExp('\033\\[0;' + code + 'm', 'g'), start);
      });
      msg = msg.replace(/\033\[1m/g, '<b>').replace(/\033\[22m/g, '</b>');
      msg = msg.replace(/\033\[3m/g, '<i>').replace(/\033\[23m/g, '</i>');
      msg = msg.replace(/\033\[m/g, end);
      msg = msg.replace(/\033\[0m/g, end);
      msg = msg.replace(/\033\[39m/g, end);
      msg = msg.replace(/\033\[2m/g, '<span>');
      msg = msg.replace(/\033\[0;39m/g, end);
      log.debug("Running replacement on message: ", msg);
      return msg;
    });
  });

  _module.controller("Kubernetes.PodLogLinkController", ($scope, TerminalService, $templateCache) => {

    $scope.openLogs = (entity, container) => {
      var name = entity.metadata.name;
      if (container) {
        name = name + ":" + container.name;
      }
      log.debug("Open logs: ", entity);
      TerminalService.newTerminal(entity.metadata.selfLink, name, $templateCache.get(UrlHelpers.join(templatePath, 'logShell.html')));
    }

  });

  _module.directive('podLogDisplay', (userDetails, PodLogReplacements) => {
    return {
      restrict: 'E',
      template: `
        <div class="pod-log-lines">
          <p ng-hide="fetched">Please wait, fetching logs...</p>
          <p ng-hide="messages.length || previous">View <a href="" ng-click="previous=!previous">previous container logs</a>?</p>
          <p ng-repeat="message in messages track by $index" ng-bind-html="message"></p>
        </div>
      `,
      link: (scope:any, element, attr) => {
        var link = scope.$eval('podLink || item.metadata.selfLink');
        var name = scope.$eval('containerName || containerId');
        
        console.log("link: ", link, " name: ", name);

        if (!link) {
          return;
        }

        scope.fetched = false;
        scope.previous = false;
        scope.messages = [];

        link = UrlHelpers.join(masterApiUrl(), link, 'log');
        link = KubernetesAPI.wsUrl(link);
        var search = {
          container: name,
          follow: true,
          tailLines: 1000
        };
        if (userDetails.token) {
          search['access_token'] = userDetails.token;
        }
        link.search(search);

        var messages = [];

        var pullMessages = _.debounce(() => {
          scope.messages = scope.messages.concat(_.remove(messages, () => true).map((msg) => {
            PodLogReplacements.forEach((replFunc:any) => {
              if (angular.isFunction(replFunc)) {
                msg = replFunc(msg);
              }
            });
            return msg;
          }));
          if (!scope.fetched) {
            scope.fetched = true;
          }
          Core.$apply(scope);
        }, 1000);

        function initSocket(link) {
          scope.fetched = false;
          messages.length = 0;
          scope.messages.length = 0;
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
          return ws;
        }

        var ws = initSocket(link);

        scope.$watch('previous', (value, old) => {
          if (value !== old) {
            if (link.hasSearch('previous')) {
              link.removeSearch('previous').addSearch('previous', scope.previous);
            } else {
              link.addSearch('previous', scope.previous);
            }
            ws.close();
            ws = initSocket(link);
          }
        });

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
        //addWindowActions(scope, element, TerminalService);
        scope.atBottom = true;
        /*
        scope.$watch('atBottom', (val) => {
          console.log("atBottom: ", val);
        });
        */
      }
    };
  });

}
