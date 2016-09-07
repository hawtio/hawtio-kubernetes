/// <reference path="../../includes.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesHelpers.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesInterfaces.ts"/>
/// <reference path="../../kubernetes/ts/kubernetesModel.ts"/>
/// <reference path="developerPlugin.ts"/>
/// <reference path="developerEnrichers.ts"/>
/// <reference path="developerHelpers.ts"/>
/// <reference path="developerNavigation.ts"/>

module Developer {

  _module.directive('hawtioBuildLogPanel', () => {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: UrlHelpers.join(templatePath, 'logPanel.html'),
      link: ($scope, $element, $attrs) => {
        $element.css({ height: 250 });
      }
    }
  });

  export function clickApprove(element, url) {
    var $scope: any = angular.element(element).scope();
    if ($scope) {
      $scope.approve(url, element.text);
    }
  }

  export var JenkinsLogController = _module.controller("Developer.JenkinsLogController", ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
        $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, $modal, KubernetesApiURL, ServiceRegistry, $element) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;

    $scope.selectedBuild = $scope.$eval('build') || $scope.$eval('selectedBuild');

    $scope.id = $scope.$eval('build.id') || $routeParams["id"];
    $scope.schema = KubernetesSchema;
    $scope.entityChangedCache = {};

    $element.on('$destroy', () => {
      $scope.$destroy();
    });

    $scope.log = {
      html: "",
      start: 0,
      firstIdx: null
    };

    $scope.$on('kubernetesModelUpdated', function () {
      updateJenkinsLink();
      Core.$apply($scope);
    });

    $scope.$on('jenkinsSelectedBuild', (event, build) => {
      log.info("==== jenkins build selected! " + build.id + " " + build.$jobId);
      $scope.selectedBuild = build;
    });


    $scope.$watch('selectedBuild', (selectedBuild) => {
      log.info("Selected build updated: ", selectedBuild);
      $scope.fetch();
    });

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
    $scope.breadcrumbConfig = createJenkinsBreadcrumbs($scope.id, getJobId(), getBuildId());
    $scope.subTabConfig = createJenkinsSubNavBars($scope.id, getJobId(), getBuildId(), {
      label: "Log",
      class: "fa fa-tasks",
      isValid: () => true,
      active: true,
      title: "Views the logs of this build"
    });

    function getJobId() {
      // lets allow the parent scope to be used too for when this is used as a panel
      return $routeParams["job"] || ($scope.selectedBuild || {}).$jobId;
    }
    $scope.getJobId = getJobId;

    function getBuildId() {
      // lets allow the parent scope to be used too for when this is used as a panel
      return $routeParams["build"] || ($scope.selectedBuild || {}).id;
    }
    $scope.getBuildId = getBuildId;

    function updateJenkinsLink() {
      var jenkinsUrl = jenkinsLink();
      if (jenkinsUrl) {
        $scope.$viewJenkinsBuildLink = UrlHelpers.join(jenkinsUrl, "job", getJobId(), getBuildId());
        $scope.$viewJenkinsLogLink = UrlHelpers.join($scope.$viewJenkinsBuildLink, "console");
      }
    }

    var lastJson = '';

    var querySize = 50000;

    $scope.approve = (url, operation) => {
      var modal = $modal.open({
      templateUrl: UrlHelpers.join(templatePath, 'jenkinsApproveModal.html'),
      controller: ['$scope', '$modalInstance', ($scope, $modalInstance) => {
        $scope.operation = operation;
        $scope.header = operation + "?";
        $scope.ok = () => {
          modal.close();
          postToJenkins(url, operation);
        };
        $scope.cancel = () => {
          modal.dismiss();
        };
      }]
      });
    };

    function postToJenkins(uri, operation) {
      var url =  Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(jenkinsServiceNameAndPort, uri);
      if (url) {
        var body = null;
        var config = {
        headers: {
        }
        };
        log.info("posting to jenkinsUrl: " + url);
        $http.post(url, body, config).
          success(function (data, status, headers, config) {
            log.info("Managed to " + operation + " at " + url);
          }).
        error(function (data, status, headers, config) {
          log.warn("Failed " + operation + " job at " + url + " " + data + " " + status);
        });
      } else {
        log.warn("Cannot post to jenkins URI: " + uri + " as no jenkins found!");
      }
    }

    $scope.$keepPolling = () => Kubernetes.keepPollingModel;

    function getLogLength() {
      return ($scope.log.logs ? $scope.log.logs.length : 0);
    }

    // Log fetching loop
    $scope.fetch = PollHelpers.setupPolling($scope, (doNext:() => void) => {
      if ($scope.$eval('hideLogs && !build.building')) {
        log.debug("Log hidden, not fetching logs");
        return;
      } else {
        log.debug("Fetching logs for build: ", $scope.$eval('build'));
      }
      var lastCount = getLogLength();
      var next = () => {
        if (lastCount !== getLogLength()) {
          // Notify parent scopes that logs have changed so they can react
          log.debug("Notifying parent");
          $scope.$emit('logViewPollUpdate');
        }
        doNext();
      }
      var buildId = getBuildId();
      var jobId = getJobId();
      //log.info("=== jenkins log querying job " + jobId + " build " + buildId + " selected build " +  $scope.selectedBuild);
      if (jobId && buildId) {
        if ($scope.buildId !== buildId || $scope.jobId !== jobId) {
          // lets clear the query
          $scope.log = {
            html: "",
            start: 0,
            firstIdx: null
          };
        }
        $scope.buildId = buildId;
        $scope.jobId = jobId;

        var url = Kubernetes.kubernetesProxyUrlForServiceCurrentNamespace(jenkinsServiceNameAndPort, UrlHelpers.join("job", jobId, buildId, "fabric8/logHtml?tail=1&start=" + $scope.log.start + "&size=" + querySize));
        if ($scope.log.firstIdx !== null) {
          url += "&first=" + $scope.log.firstIdx;
        }
        if (url && (!$scope.log.fetched || Kubernetes.keepPollingModel)) {
          $http.post(url).
            success(function (data, status, headers, config) {
              var json = angular.toJson(data);
              if (json === lastJson) {
                log.info("Data returned from jenkins is the same!");
              } else {
                lastJson = json;
              }
              if (data) {
                var replaceClusterIPsInHtml = replaceClusterIpFunction();

                if (!$scope.log.logs) {
                  $scope.log.logs = [];
                }
                var lines = data.lines;
                var returnedLength = data.returnedLength;
                var logLength = data.logLength;
                var returnedStart = data.start;
                var earlierLog = false;
                if (angular.isDefined(returnedStart)) {
                  earlierLog = returnedStart < $scope.log.start;
                }
                var lineSplit = data.lineSplit;
                // log.info("start was: " + $scope.log.start + " first: " + $scope.log.firstIdx + " => returnedLength: " + returnedLength + " logLength: " + logLength +  " returnedStart: " + returnedStart + " earlierLog: " + earlierLog + " lineSplit: " + lineSplit);
                if (lines) {
                  var currentLogs = $scope.log.logs;

                  // lets re-join split lines
                  if (lineSplit && currentLogs.length) {
                    var lastIndex;
                    var restOfLine;
                    if (earlierLog) {
                      lastIndex = 0;
                      restOfLine = lines.pop();
                      if (restOfLine) {
                        currentLogs[lastIndex] = replaceClusterIPsInHtml(restOfLine + currentLogs[lastIndex]);
                      }
                    } else {
                      lastIndex = currentLogs.length - 1;
                      restOfLine = lines.shift();
                      if (restOfLine) {
                        currentLogs[lastIndex] = replaceClusterIPsInHtml(currentLogs[lastIndex] + restOfLine);
                      }
                    }
                  }
                  for (var i = 0; i < lines.length; i++) {
                    lines[i] = replaceClusterIPsInHtml(lines[i]);
                  }
                  if (earlierLog) {
                    $scope.log.logs = lines.concat(currentLogs);
                  } else {
                    $scope.log.logs = currentLogs.concat(lines);
                  }
                }
                var moveForward = true;
                if (angular.isDefined(returnedStart)) {
                  if (returnedStart > $scope.log.start && $scope.log.start === 0) {
                    // we've jumped to the end of the file to read the tail of it
                    $scope.log.start = returnedStart;
                    $scope.log.firstIdx = returnedStart;
                  } else if ($scope.log.firstIdx === null) {
                    // lets remember where the first request started
                    $scope.log.firstIdx = returnedStart;
                  } else if (returnedStart < $scope.log.firstIdx) {
                    // we've got an earlier bit of the log
                    // after starting at the tail
                    // so lets move firstIdx backwards and leave start as it is (at the end of the file)
                    $scope.log.firstIdx = returnedStart;
                    moveForward = false;
                  }
                }
                if (moveForward && returnedLength && !earlierLog) {
                  $scope.log.start += returnedLength;
                  if (logLength && $scope.log.start > logLength) {
                    $scope.log.start = logLength;
                  }
                }
                updateJenkinsLink();
              }
              $scope.log.fetched = true;
              // Core.$apply($scope);
              next();
            }).
          error(function (data, status, headers, config) {
            log.warn("Failed to load " + url + " " + data + " " + status);
            next();
          });
        }
      } else {
        $scope.log.fetched = true;
        Core.$apply($scope);
        next();
      }
    });

    if (angular.isFunction($scope.fetch)) {
      $scope.fetch();
    }


    function replaceClusterIpFunction() {
      function createReplaceFunction(from, to) {
        return (text) => replaceText(text, from, to);
      }

      var replacements = [];
      angular.forEach($scope.model.services, (service) => {
        var $portalIP = service.$portalIP;
        var $serviceUrl = service.$serviceUrl;
        var $portsText = service.$portsText;
        if ($portalIP && $serviceUrl) {
          var idx = $serviceUrl.indexOf("://");
          if (idx > 0) {
            var replaceWith = $serviceUrl.substring(idx, $serviceUrl.length);
            if (!replaceWith.endsWith("/")) {
              replaceWith += "/";
            }
            if (replaceWith.length > 4) {
              replacements.push(createReplaceFunction(
                    "://" + $portalIP + "/",
                    replaceWith
                    ));
              if ($portsText) {
                var suffix = ":" + $portsText;
                var serviceWithPort = replaceWith.substring(0, replaceWith.length - 1);
                if (!serviceWithPort.endsWith(suffix)) {
                  serviceWithPort += suffix;
                }
                serviceWithPort += "/";
                replacements.push(createReplaceFunction(
                      "://" + $portalIP + ":" + $portsText + "/",
                      serviceWithPort
                      ));
              }
            }
          }
        }
      });

      function addReplaceFn(from, to) {
        replacements.push((text) => {
          return replaceText(text, from, to);
        });

      }
      addReplaceFn("[INFO]", "<span class='log-success'>[INFO]</span>");
      addReplaceFn("[WARN]", "<span class='log-warn'>[WARN]</span>");
      addReplaceFn("[WARNING]", "<span class='log-warn'>[WARNING]</span>");
      addReplaceFn("[ERROR]", "<span class='log-error'>[ERROR]</span>");
      addReplaceFn("FAILURE", "<span class='log-error'>FAILURE</span>");
      addReplaceFn("SUCCESS", "<span class='log-success'>SUCCESS</span>");

      // lets try convert the Proceed / Abort links
      replacements.push((text) => {
        var prefix = "<a href='#' onclick=\"new Ajax.Request('";
        var idx = 0;
        while (idx >= 0) {
          idx = text.indexOf(prefix, idx);
          if (idx >= 0) {
            var start = idx + prefix.length;
            var endQuote = text.indexOf("'", start + 1);
            if (endQuote <= 0) {
              break;
            }
            var endDoubleQuote = text.indexOf('"', endQuote + 1);
            if (endDoubleQuote <= 0) {
              break;
            }
            var url = text.substring(start, endQuote);
            // TODO using $compile is a tad complex, for now lets cheat with a little onclick ;)
            //text = text.substring(0, idx) + "<a class='btn btn-default btn-lg' ng-click=\"approve('" + url + "')\"" + text.substring(endDoubleQuote + 1);
            text = text.substring(0, idx) + "<a class='btn btn-default btn-lg' onclick=\"Developer.clickApprove(this, '" + url + "')\"" + text.substring(endDoubleQuote + 1);
          }
        }
        return text;
      });
      return function(text) {
        var answer = text;
        angular.forEach(replacements, (fn) => {
          answer = fn(answer);
        });
        return answer;
      }
    }

    function replaceText(text, from, to) {
      if (from && to && text) {
        //log.info("Replacing '" + from + "' => '" + to + "'");
        var idx = 0;
        while (true) {
          idx = text.indexOf(from, idx);
          if (idx >= 0) {
            text = text.substring(0, idx) + to + text.substring(idx + from.length);
            idx += to.length;
          } else {
            break;
          }
        }
      }
      return text;
    }
  });

}
