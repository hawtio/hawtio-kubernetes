/// <reference path="../../includes.ts"/>
module Kubernetes {

  export var context = '/kubernetes';
  export var hash = '#' + context;
  export var defaultRoute = hash + '/apps';
  export var pluginName = 'Kubernetes';
  export var pluginPath = 'plugins/kubernetes/';
  export var templatePath = pluginPath + 'html/';
  export var log:Logging.Logger = Logger.get(pluginName);

  export var keepPollingModel = true;

  export var defaultIconUrl = Core.url("/img/kubernetes.svg");
  export var hostIconUrl = Core.url("/img/host.svg");

  export var defaultApiVersion = "v1beta2";
  export var defaultOSApiVersion = "v1beta1";
  export var labelFilterTextSeparator = ",";

  export var defaultNamespace = "default";

  export var appSuffix = ".app";

  export var osapiPrefix = "/kubernetes/osapi/";
  export var buildConfigsRestURL = osapiPrefix + defaultOSApiVersion + "/buildConfigs";
  export var buildConfigHooksRestURL = osapiPrefix + defaultOSApiVersion + "/buildConfigHooks";
  export var buildsRestURL = osapiPrefix + defaultOSApiVersion + "/builds";
  export var buildsLogsRestURL = osapiPrefix + defaultOSApiVersion + "/proxy/buildLogs";
  export var routesRestURL = osapiPrefix + defaultOSApiVersion + "/routes";
  export var deploymentConfigsRestURL = osapiPrefix + defaultOSApiVersion + "/deploymentConfigs";
  export var imageRepositoriesRestURL = osapiPrefix + defaultOSApiVersion + "/imageRepositories";

  export interface KubePod {
    id:string;
    namespace:string;
  }

  //var fabricDomain = Fabric.jmxDomain;
  var fabricDomain = "io.fabric8";
  export var mbean = fabricDomain + ":type=Kubernetes";
  export var managerMBean = fabricDomain + ":type=KubernetesManager";
  export var appViewMBean = fabricDomain + ":type=AppView";

  export function isKubernetes(workspace) {
    // return workspace.treeContainsDomainAndProperties(fabricDomain, {type: "Kubernetes"});
    return true;
  }

  export function isKubernetesTemplateManager(workspace) {
    // return workspace.treeContainsDomainAndProperties(fabricDomain, {type: "KubernetesTemplateManager"});
    return true;
  }

  export function isAppView(workspace) {
    // return workspace.treeContainsDomainAndProperties(fabricDomain, {type: "AppView"});
    return true;
  }

  /**
   * Updates the namespaces value in the kubernetes object from the namespace values in the pods, controllers, services
   */
  export function updateNamespaces(kubernetes, pods = [], replicationControllers = [], services = []) {
    var byNamespace = (thing) => { return thing.namespace; };

    function pushIfNotExists(array, items) {
        angular.forEach(items, (value) => {
            if ($.inArray(value, array) < 0) {
              array.push(value);
            }
        });
    }
    var namespaces = [];

    pushIfNotExists(namespaces, pods.map(byNamespace));
    pushIfNotExists(namespaces, services.map(byNamespace));
    pushIfNotExists(namespaces, replicationControllers.map(byNamespace));

    namespaces = namespaces.sort();

    kubernetes.namespaces = namespaces;
    kubernetes.selectedNamespace = kubernetes.selectedNamespace || namespaces[0];
  }

  export function setJson($scope, id, collection) {
    $scope.id = id;
    if (!$scope.fetched) {
      return;
    }
    if (!id) {
      $scope.json = '';
      return;
    }
    if (!collection) {
      return;
    }
    var item = collection.find((item) => { return item.id === id; });
    if (item) {
      $scope.json = angular.toJson(item, true);
      $scope.item = item;
    } else {
      $scope.id = undefined;
      $scope.json = '';
      $scope.item = undefined;
    }
  }



  /**
   * Returns the labels text string using the <code>key1=value1,key2=value2,....</code> format
   */
  export function labelsToString(labels, seperatorText = labelFilterTextSeparator) {
    var answer = "";
    angular.forEach(labels, (value, key) => {
      var separator = answer ? seperatorText : "";
      answer += separator + key + "=" + value;
    });
    return answer;
  }


  export function initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL) {
    if (!KubernetesState.selectedNamespace) {
      KubernetesState.selectedNamespace = $routeParams.namespace || $location.search()["namespace"];
    }
    if (!KubernetesState.selectedNamespace) {
      if (angular.isArray(KubernetesState.namespaces) && KubernetesState.namespaces.length) {
        KubernetesState.selectedNamespace = KubernetesState.namespaces[0];
      }
    }
    var injector = HawtioCore.injector;
    if (injector) {
      var ServiceRegistry = injector.get("ServiceRegistry");
      if (ServiceRegistry) {
        $scope.hasService = (name) => ServiceRegistry.hasService(name);
      }
    }
    $scope.namespace = KubernetesState.selectedNamespace || defaultNamespace;
    $scope.forgeEnabled = isForgeEnabled();
    $scope.resizeDialog = {
      controller: null,
      newReplicas: 0,
      dialog: new UI.Dialog(),
      onOk: () => {
        var resizeDialog = $scope.resizeDialog;
        resizeDialog.dialog.close();
        resizeController($http, KubernetesApiURL, resizeDialog.controller, resizeDialog.newReplicas, () => {
          // lets immediately update the replica count to avoid waiting for the next poll
          ($scope.resizeDialog.controller.currentState || {}).replicas = $scope.resizeDialog.newReplicas;
          Core.$apply($scope);
        })
      },
      open: (controller) => {
        var resizeDialog = $scope.resizeDialog;
        resizeDialog.controller = controller;
        resizeDialog.newReplicas = Core.pathGet(controller, ["currentState", "replicas"]);
        resizeDialog.dialog.open();

        $timeout(() => {
          $('#replicas').focus();
        }, 50);
      },
      close: () => {
        $scope.resizeDialog.dialog.close();
      }
    };

    $scope.triggerBuild = (buildConfig) => {
      var url = buildConfig.$triggerUrl;
      console.log("triggering build at url: " + url);
      if (url) {
        //var data = {};
        var data = null;
        var config = {
          headers: {
            'Content-Type': "application/json"
          }
        };
        var name = Core.pathGet(buildConfig, ["metadata", "name"]);
        Core.notification('info', "Triggering build " + name);
        $http.post(url, data, config).
          success(function (data, status, headers, config) {
            console.log("trigger worked! got data " + angular.toJson(data, true));
            // TODO should we show some link to the build
            Core.notification('info', "Building " + name);
          }).
          error(function (data, status, headers, config) {
            log.warn("Failed to load " + url + " " + data + " " + status);
            Core.notification('error', "Failed to trigger build for " + name + ". Returned code: " + status + " " + data);
          });
      };
    }

    // update the URL if the filter is changed
    $scope.$watch("tableConfig.filterOptions.filterText", (text) => {
      $location.search("q", text);
    });

    $scope.$on("labelFilterUpdate", ($event, text) => {
      var filterOptions = ($scope.tableConfig || {}).filterOptions || {};
      var currentFilter = filterOptions.filterText;
      if (Core.isBlank(currentFilter)) {
        filterOptions.filterText = text;
      } else {
        var expressions = currentFilter.split(/\s+/);
        if (expressions.any(text)) {
          // lets exclude this filter expression
          expressions = expressions.remove(text);
          filterOptions.filterText = expressions.join(" ");
        } else {
          filterOptions.filterText = currentFilter + " " + text;
        }
      }
      $scope.id = undefined;
    });
  }

  /**
   * Given the list of pods lets iterate through them and find all pods matching the selector
   * and return counters based on the status of the pod
   */
  export function createPodCounters(selector, pods, outputPods = [], podLinkQuery = null) {
    var filterFn;
    if (angular.isFunction(selector)) {
      filterFn = selector;
    } else {
      filterFn = (pod) => selectorMatches(selector, pod.labels);
    }
    var answer = {
      podsLink: "",
      valid: 0,
      waiting: 0,
      error: 0
    };
    if (selector) {
      if (!podLinkQuery) {
        podLinkQuery = Kubernetes.labelsToString(selector, " ");
      }
      answer.podsLink = Core.url("/kubernetes/pods?q=" + encodeURIComponent(podLinkQuery));
      angular.forEach(pods, pod => {
        if (filterFn(pod)) {
          outputPods.push(pod);
          var status = (pod.currentState || {}).status;

          if (status) {
            var lower = status.toLowerCase();
            if (lower.startsWith("run")) {
              answer.valid += 1;
            } else if (lower.startsWith("wait")) {
              answer.waiting += 1;
            } else if (lower.startsWith("term") || lower.startsWith("error") || lower.startsWith("fail")) {
              answer.error += 1;
            }
          } else {
            answer.error += 1;
          }
        }
      });
    }
    return answer;
  }

  /**
   * Converts the given json into an array of items. If the json contains a nested set of items then that is sorted; so that services
   * are processed first; then turned into an array. Otherwise the json is put into an array so it can be processed polymorphically
   */
  export function convertKubernetesJsonToItems(json) {
    var items = json.items;
    if (angular.isArray(items)) {
      // TODO we could check for List or Config types here and warn if not

      // sort the services first
      var answer = [];
      items.forEach((item) => {
        if (item.kind === "Service") {
          answer.push(item);
        }
      });
      items.forEach((item) => {
        if (item.kind !== "Service") {
          answer.push(item);
        }
      });
      return answer;
    } else {
      return [json];
    }
  }

  export function isV1beta1Or2() {
    return defaultApiVersion === "v1beta1" || defaultApiVersion === "v1beta2";
  }

  /**
   * Returns a link to the detail page for the given entity
   */
  export function entityPageLink(entity) {
    if (entity) {
      var id = entity.id;
      var kind = entity.kind;
      if (kind && id) {
        var path = kind.substring(0, 1).toLowerCase() + kind.substring(1) + "s";
        var namespace = entity.namespace;
        if (namespace && !isIgnoreNamespaceKind(kind)) {
          return UrlHelpers.join('/kubernetes/namespace', namespace, path, id);
        } else {
          return UrlHelpers.join('/kubernetes', path, id);
        }
      }
    }
    return null;
  }


  export function resourceKindToUriPath(kind) {
    var kindPath = kind.toLowerCase() + "s";
    if (kindPath === "replicationcontrollers" && isV1beta1Or2()) {
      kindPath = "replicationControllers";
    }
    return kindPath;
  }

  function isIgnoreNamespaceKind(kind) {
    return kind === "Host" || kind === "Minion";
  }

  /**
   * Returns the root URL for the kind
   */
  export function kubernetesUrlForKind(KubernetesApiURL, kind, namespace = null, path = null) {
    var pathSegment = "";
    if (path) {
      pathSegment = "/" + Core.trimLeading(path, "/");
    }
    var kindPath = resourceKindToUriPath(kind);
    var ignoreNamespace = isIgnoreNamespaceKind(kind);
    if (isV1beta1Or2() || ignoreNamespace) {
      var postfix = "";
      if (namespace && !ignoreNamespace) {
        postfix = "?namespace=" + namespace;
      }
      return UrlHelpers.join(KubernetesApiURL, "/api/" + defaultApiVersion + "/" + kindPath + pathSegment + postfix);
    } else {
      return UrlHelpers.join(KubernetesApiURL, "/api/" + defaultApiVersion + "/ns/" + namespace + "/" + kindPath + pathSegment + postfix);
    }
  };

  /**
   * Returns the base URL for the kind of kubernetes resource or null if it cannot be found
   */
  export function kubernetesUrlForItemKind(KubernetesApiURL, json) {
    var kind = json.kind;
    if (kind) {
      return kubernetesUrlForKind(KubernetesApiURL, kind, json.namespace);
    } else {
      log.warn("Ignoring missing kind " + kind + " for kubernetes json: " + angular.toJson(json));
      return null;
    }
  }

  export function kubernetesProxyUrlForService(KubernetesApiURL, service, path = null) {
    var pathSegment = "";
    if (path) {
      pathSegment = "/" + Core.trimLeading(path, "/");
    } else {
      pathSegment = "/";
    }
    var namespace = service.namespace;
    if (isV1beta1Or2()) {
      var postfix = "?namespace=" + namespace;
      return KubernetesApiURL.then((KubernetesApiURL) => {
        return UrlHelpers.join(KubernetesApiURL, "/api/" + defaultApiVersion + "/proxy/services/" + service.id + pathSegment + postfix);
      });
    } else {
      return KubernetesApiURL.then((KubernetesApiURL) => {
        return UrlHelpers.join(KubernetesApiURL, "/api/" + defaultApiVersion + "/ns/" + namespace + "/services/" + service.name + pathSegment);
      });
    }
  }

  export function buildConfigRestUrl(id) {
    return UrlHelpers.join(buildConfigsRestURL, id);
  }

  export function deploymentConfigRestUrl(id) {
    return UrlHelpers.join(deploymentConfigsRestURL, id);
  }

  export function imageRepositoryRestUrl(id) {
    return UrlHelpers.join(imageRepositoriesRestURL, id);
  }

  export function buildRestUrl(id) {
    return UrlHelpers.join(buildsRestURL, id);
  }

  export function buildLogsRestUrl(id) {
    return UrlHelpers.join(buildsLogsRestURL, id);
  }

  /**
   * Runs the given application JSON
   */
  export function runApp($location, $scope, $http, KubernetesApiURL, json, name = "App", onSuccessFn = null, namespace = null, onCompleteFn = null) {
    if (json) {
      if (angular.isString(json)) {
        json = angular.fromJson(json);
      }
      name = name || "App";
      var postfix = namespace ? " in namespace " + namespace : "";
      Core.notification('info', "Running " + name + postfix);

      KubernetesApiURL.then((KubernetesApiURL) => {
        var items = convertKubernetesJsonToItems(json);
        angular.forEach(items, (item) => {
          var url = kubernetesUrlForItemKind(KubernetesApiURL, item);
          if (url) {
            $http.post(url, item).
              success(function (data, status, headers, config) {
                log.debug("Got status: " + status + " on url: " + url + " data: " + data + " after posting: " + angular.toJson(item));
                if (angular.isFunction(onCompleteFn)) {
                  onCompleteFn();
                }
                Core.$apply($scope);
              }).
              error(function (data, status, headers, config) {
                var message = null;
                if (angular.isObject(data)) {
                  message = data.message;
                  var reason = data.reason;
                  if (reason === "AlreadyExists") {
                    // lets ignore duplicates
                    log.debug("entity already exists at " + url);
                    return;
                  }
                }
                if (!message) {
                  message = "Failed to POST to " + url + " got status: " + status;
                }
                log.warn("Failed to save " + url + " status: " + status + " response: " + angular.toJson(data, true));
                Core.notification('error', message);
              });
          }
        });
      });
    }
  }


  /**
   * Returns true if the current status of the pod is running
   */
  export function isRunning(podCurrentState) {
    var status = (podCurrentState || {}).status;
    if (status) {
      var lower = status.toLowerCase();
      return lower.startsWith("run");
    } else {
      return false;
    }
  }

  /**
   * Returns true if the labels object has all of the key/value pairs from the selector
   */
  export function selectorMatches(selector, labels) {
    if (angular.isObject(labels)) {
      var answer = true;
      var count = 0;
      angular.forEach(selector, (value, key) => {
        count++;
        if (answer && labels[key] !== value) {
          answer = false;
        }
      });
      return answer && count > 0;
    } else {
      return false;
    }
  }


  /**
   * Returns a link to the kibana logs web application
   */
  export function kibanaLogsLink(ServiceRegistry) {
    var link = ServiceRegistry.serviceLink("kibana-service");
    if (link) {
      if (!link.endsWith("/")) {
        link += "/";
      }
      return link + "#/dashboard/Fabric8";
    } else {
      return null;
    }
  }

  export function openLogsForPods(ServiceRegistry, $window, namespace, pods) {
    var link = kibanaLogsLink(ServiceRegistry);
    if (link) {
      var query = "";
      var count = 0;
      angular.forEach(pods, (item) => {
        var id = item.id;
        if (id) {
          var space = query ? " OR " : "";
          count++;
          query += space + '"' + id + '"';
        }
      });
      if (query) {
        if (count > 1) {
          query = "(" + query + ")";
        }
        query = 'pod_namespace:"' + namespace + '" AND pod:' + query;
        link += "?_a=(query:(query_string:(query:'" + query + "')))";
        var newWindow = $window.open(link, "viewLogs");
      }
    }
  }

  export function resizeController($http, KubernetesApiURL, replicationController, newReplicas, onCompleteFn = null) {
    var id = replicationController.id;
    var namespace = replicationController.namespace || "";
    KubernetesApiURL.then((KubernetesApiURL) => {
      var url = kubernetesUrlForKind(KubernetesApiURL, "ReplicationController", namespace, id);
      $http.get(url).
        success(function (data, status, headers, config) {
          if (data) {
            var desiredState = data.desiredState;
            if (!desiredState) {
              desiredState = {};
              data.desiredState = desiredState;
            }
            desiredState.replicas = newReplicas;
            $http.put(url, data).
              success(function (data, status, headers, config) {
                log.debug("updated controller " + url);
                if (angular.isFunction(onCompleteFn)) {
                  onCompleteFn();
                }
              }).
              error(function (data, status, headers, config) {
                log.warn("Failed to save " + url + " " + data + " " + status);
              });
          }
        }).
        error(function (data, status, headers, config) {
          log.warn("Failed to load " + url + " " + data + " " + status);
        });
    }, (response) => {
      log.debug("Failed to get rest API URL, can't resize controller " + id + " resource: ", response);
    });
  }

  export function statusTextToCssClass(text) {
    if (text) {
      var lower = text.toLowerCase();
      if (lower.startsWith("run") || lower.startsWith("ok")) {
        return 'fa fa-play-circle green';
      } else if (lower.startsWith("wait")) {
        return 'fa fa-download';
      } else if (lower.startsWith("term") || lower.startsWith("error") || lower.startsWith("fail")) {
        return 'fa fa-off orange';
      } else if (lower.startsWith("succeeded")) {
        return 'fa fa-check-circle-o green';
      }
    }
    return 'fa fa-question red';
  }

  export function podStatus(pod) {
    var currentStatus = (pod || {}).currentState || {};
    return currentStatus.status;
  }

  export function createAppViewPodCounters(appView) {
    var array = [];
    var map = {};
    var pods = appView.pods;
    var lowestDate = null;
    angular.forEach(pods, pod => {
      var selector = pod.labels;
      var selectorText = Kubernetes.labelsToString(selector, " ");
      var answer = map[selector];
      if (!answer) {
        answer = {
          labelText: selectorText,
          podsLink: Core.url("/kubernetes/pods?q=" + encodeURIComponent(selectorText)),
          valid: 0,
          waiting: 0,
          error: 0
        };
        map[selector] = answer;
        array.push(answer);
      }
      var status = (podStatus(pod) || "Error").toLowerCase();
      if (status.startsWith("run") || status.startsWith("ok")) {
        answer.valid += 1;
      } else if (status.startsWith("wait")) {
        answer.waiting += 1;
      } else {
        answer.error += 1;
      }
      var creationTimestamp = pod.creationTimestamp;
      if (creationTimestamp) {
        var d = new Date(creationTimestamp);
        if (!lowestDate || d < lowestDate) {
          lowestDate = d;
        }
      }
    });
    appView.$creationDate = lowestDate;
    return array;
  }

  export function createAppViewServiceViews(appView) {
    var array = [];
    var pods = appView.pods;
    angular.forEach(pods, pod => {
      var id = pod.id;
      if (id) {
        var abbrev = id;
        var idx = id.indexOf("-");
        if (idx > 1) {
          abbrev = id.substring(0, idx);
        }
        pod.idAbbrev = abbrev;
      }
      pod.statusClass = statusTextToCssClass(podStatus(pod));
    });

    var services = appView.services || [];
    var replicationControllers = appView.replicationControllers || [];
    var size = Math.max(services.length, replicationControllers.length, 1);
    var appName = appView.$info.name;
    for (var i = 0; i < size; i++) {
      var service = services[i];
      var replicationController = replicationControllers[i];
      var controllerId = (replicationController || {}).id;
      var name = (service || {}).id || controllerId;
      var address = (service || {}).portalIP;
      if (!name && pods.length) {
        name = pods[0].idAbbrev;
      }
      if (!appView.$info.name) {
        appView.$info.name = name;
      }
      if (!appView.id && pods.length) {
        appView.id = pods[0].id;
      }
      if (i > 0) {
        appName = name;
      }
      var podCount = pods.length;
      var podCountText = podCount + " pod" + (podCount > 1 ? "s" : "");
      var view = {
        appName: appName || name,
        name: name,
        createdDate: appView.$creationDate,
        podCountText: podCountText,
        address: address,
        controllerId: controllerId,
        service: service,
        replicationController: replicationController,
        pods: pods
      };
      array.push(view);
    }
    return array;
  }

  /**
   * converts a git path into an accessible URL for the browser
   */
  export function gitPathToUrl(iconPath, branch = "master") {
    return (HawtioCore.injector.get('AppLibraryURL') || '') + "/git/" + branch + iconPath;
  }


  export function enrichBuildConfig(buildConfig, sortedBuilds) {
    if (buildConfig) {
      var triggerUrl:string = null;
      var name = Core.pathGet(buildConfig, ["metadata", "name"]);
      buildConfig.$name = name;
      if (name) {
        angular.forEach([false, true], (flag) => {
          angular.forEach(buildConfig.triggers, (trigger) => {
            if (!triggerUrl) {
              var type = trigger.type;
              if (type === "generic" || flag) {
                var generic = trigger[type];
                if (type && generic) {
                  var secret = generic.secret;
                  if (secret) {
                    triggerUrl = UrlHelpers.join(buildConfigHooksRestURL, name, secret, type);
                    buildConfig.$triggerUrl = triggerUrl;
                  }
                }
              }
            }
          });
        });

        // lets find the latest build...
        if (sortedBuilds) {
          buildConfig.$lastBuild = _.find(sortedBuilds, {
            metadata: {
              labels: {
                buildconfig: name
              }
            }
          });
        }
      }
    }
  }

  export function enrichBuildConfigs(buildConfigs, sortedBuilds) {
    angular.forEach(buildConfigs, (buildConfig) => {
      enrichBuildConfig(buildConfig, sortedBuilds);
    });
    return buildConfigs;
  }

  export function enrichBuilds(builds) {
    angular.forEach(builds, (build) => {
      enrichBuild(build);
    });
    return _.sortBy(builds, "$creationDate").reverse();
  }

  export function enrichBuild(build) {
    if (build) {
      var metadata = build.metadata || {};
      var name = metadata.name;
      var namespace = metadata.namespace;
      build.$name = name;
      build.$namespace = namespace;

      var nameArray = name.split("-");
      var nameArrayLength = nameArray.length;
      build.$shortName = (nameArrayLength > 4) ? nameArray.slice(0, nameArrayLength - 4).join("-") : name.substring(0, 30);

      var labels = metadata.labels || {};
      var configId = labels.buildconfig;
      build.$configId = configId;
      if (configId) {
        build.$configLink = UrlHelpers.join("kubernetes/buildConfigs", configId);
      }
      var creationTimestamp = metadata.creationTimestamp;
      if (creationTimestamp) {
        var d = new Date(creationTimestamp);
        build.$creationDate = d;
      }
      if (name) {
        build.$viewLink = UrlHelpers.join("kubernetes/builds", name);
        build.$logsLink = UrlHelpers.join("kubernetes/buildLogs", name);
      }
      var podName = build.podName;
      if (podName && namespace) {
        var podNameArray = podName.split("-");
        var podNameArrayLength = podNameArray.length
        build.$podShortName = (podNameArrayLength > 5) ? podNameArray[podNameArrayLength - 5] : podName.substring(0, 30);
        build.$podLink = UrlHelpers.join("kubernetes/namespace", namespace, "pods", podName);
      }
    }
    return build;
  }


  export function enrichDeploymentConfig(deploymentConfig) {
    if (deploymentConfig) {
      var triggerUrl:string = null;
      var name = Core.pathGet(deploymentConfig, ["metadata", "name"]);
      deploymentConfig.$name = name;
      var found = false;
      angular.forEach(deploymentConfig.triggers, (trigger) => {
        var type = trigger.type;
        if (!deploymentConfig.$imageChangeParams && type === "ImageChange") {
          var imageChangeParams = trigger.imageChangeParams;
          if (imageChangeParams) {
            var containerNames = imageChangeParams.containerNames || [];
            imageChangeParams.$containerNames = containerNames.join(" ");
            deploymentConfig.$imageChangeParams = imageChangeParams;
          }
        }
      });
    }
  }

  export function enrichDeploymentConfigs(deploymentConfigs) {
    angular.forEach(deploymentConfigs, (deploymentConfig) => {
      enrichDeploymentConfig(deploymentConfig);
    });
    return deploymentConfigs;
  }

  export function enrichImageRepository(imageRepository) {
    if (imageRepository) {
      var triggerUrl:string = null;
      var name = Core.pathGet(imageRepository, ["metadata", "name"]);
      imageRepository.$name = name;
    }
  }

  export function enrichImageRepositories(imageRepositories) {
    angular.forEach(imageRepositories, (imageRepository) => {
      enrichImageRepository(imageRepository);
    });
    return imageRepositories;
  }


  var labelColors = {
    'version': 'background-blue',
    'name': 'background-light-green',
    'container': 'background-light-grey'
  };

  export function containerLabelClass(labelType:string) {
    if (!(labelType in labelColors)) {
      return 'mouse-pointer';
    }
    else return labelColors[labelType] + ' mouse-pointer';
  }


  /**
   * Returns true if the fabric8 forge plugin is enabled
   */
  export function isForgeEnabled() {
    // TODO should return true if the service "fabric8-forge" is valid
    return true;
  }

  /**
   * Configures the json schema
   */
  export function configureSchema() {
    angular.forEach(schema.definitions, (definition, name) => {
      var properties = definition.properties;
      if (properties) {
        var hideProperties = ["creationTimestamp", "kind", "apiVersion", "annotations", "additionalProperties", "namespace", "resourceVersion", "selfLink", "uid"];
        angular.forEach(hideProperties, (propertyName) => {
          var property = properties[propertyName];
          if (property) {
            property["hidden"]  = true;
          }
        });
        angular.forEach(properties, (property, propertyName) => {
          var ref = property["$ref"];
          var type = property["type"];
          if (ref && (!type || type === "object")) {
            property["type"] = ref;
          }
          if (type === "array") {
            var items = property["items"];
            if (items) {
              var ref = items["$ref"];
              var type = items["type"];
              if (ref && (!type || type === "object")) {
                items["type"] = ref;
              }
            }
          }
        });
      }

      schema.definitions.os_build_WebHookTrigger.properties.secret.type = "password";
    })
  }

}
