

/// <reference path="../../includes.ts"/>
var Example;
(function (Example) {
    Example.pluginName = "hawtio-assembly";
    Example.log = Logger.get(Example.pluginName);
    Example.templatePath = "plugins/example/html";
})(Example || (Example = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="exampleGlobals.ts"/>
var Example;
(function (Example) {
    Example._module = angular.module(Example.pluginName, []);
    var tab = undefined;
    Example._module.config(['$locationProvider', '$routeProvider', 'HawtioNavBuilderProvider', function ($locationProvider, $routeProvider, builder) {
        tab = builder.create().id(Example.pluginName).title(function () { return "Example"; }).href(function () { return "/example"; }).subPath("Page 1", "page1", builder.join(Example.templatePath, 'page1.html')).build();
        builder.configureRouting($routeProvider, tab);
        $locationProvider.html5Mode(true);
    }]);
    Example._module.run(['HawtioNav', function (HawtioNav) {
        HawtioNav.add(tab);
        Example.log.debug("loaded");
    }]);
    hawtioPluginLoader.addModule(Example.pluginName);
})(Example || (Example = {}));

/// <reference path="examplePlugin.ts"/>
var Example;
(function (Example) {
    Example.Page1Controller = Example._module.controller("Example.Page1Controller", ['$scope', function ($scope) {
        $scope.target = "World!";
    }]);
})(Example || (Example = {}));

/// <reference path="../../includes.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.Apps = Kubernetes.controller("Apps", ["$scope", "KubernetesServices", "KubernetesReplicationControllers", "KubernetesPods", "KubernetesState", "KubernetesApiURL", "$templateCache", "$location", "$routeParams", "$http", "$dialog", "$timeout", "workspace", "jolokia", function ($scope, KubernetesServices, KubernetesReplicationControllers, KubernetesPods, KubernetesState, KubernetesApiURL, $templateCache, $location, $routeParams, $http, $dialog, $timeout, workspace, jolokia) {
        $scope.namespace = $routeParams.namespace;
        $scope.apps = [];
        $scope.allApps = [];
        $scope.kubernetes = KubernetesState;
        $scope.fetched = false;
        $scope.json = '';
        ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);
        ControllerHelpers.bindModelToSearchParam($scope, $location, 'appSelectorShow', 'openApp', undefined);
        ControllerHelpers.bindModelToSearchParam($scope, $location, 'mode', 'mode', 'list');
        var branch = $scope.branch || "master";
        var namespace = null;
        var defaultIconUrl = Core.url("/img/icons/kubernetes.svg");
        function appMatches(app) {
            var filterText = $scope.appSelector.filterText;
            if (filterText) {
                return Core.matchFilterIgnoreCase(app.groupId, filterText) || Core.matchFilterIgnoreCase(app.artifactId, filterText) || Core.matchFilterIgnoreCase(app.name, filterText) || Core.matchFilterIgnoreCase(app.description, filterText);
            }
            else {
                return true;
            }
        }
        function appRunning(app) {
            return $scope.apps.any(function (running) { return running.appPath === app.appPath; });
        }
        $scope.tableConfig = {
            data: 'apps',
            showSelectionCheckbox: true,
            enableRowClickSelection: false,
            multiSelect: true,
            selectedItems: [],
            filterOptions: {
                filterText: $location.search()["q"] || ''
            },
            columnDefs: [
                { field: 'icon', displayName: 'App', cellTemplate: $templateCache.get("appIconTemplate.html") },
                { field: 'services', displayName: 'Services', cellTemplate: $templateCache.get("appServicesTemplate.html") },
                { field: 'replicationControllers', displayName: 'Controllers', cellTemplate: $templateCache.get("appReplicationControllerTemplate.html") },
                { field: '$podsLink', displayName: 'Pods', cellTemplate: $templateCache.get("appPodCountsAndLinkTemplate.html") },
                { field: '$deployedText', displayName: 'Deployed', cellTemplate: $templateCache.get("appDeployedTemplate.html") },
                { field: 'namespace', displayName: 'Namespace' }
            ]
        };
        Kubernetes.initShared($scope, $location);
        $scope.expandedPods = [];
        $scope.podExpanded = function (pod) {
            var id = (pod || {}).id;
            return id && ($scope.expandedPods || []).indexOf(id) >= 0;
        };
        $scope.expandPod = function (pod) {
            var id = pod.id;
            if (id) {
                $scope.expandedPods.push(id);
            }
        };
        $scope.collapsePod = function (pod) {
            var id = pod.id;
            if (id) {
                $scope.expandedPods = $scope.expandedPods.remove(function (v) { return id === v; });
            }
        };
        $scope.$on('$routeUpdate', function ($event) {
            Kubernetes.setJson($scope, $location.search()['_id'], $scope.apps);
        });
        if (Kubernetes.isKubernetes(workspace)) {
            Core.register(jolokia, $scope, { type: 'exec', mbean: Kubernetes.mbean, operation: "findApps", arguments: [branch] }, onSuccess(onAppData));
        }
        if (Kubernetes.isAppView(workspace)) {
            Core.register(jolokia, $scope, { type: 'exec', mbean: Kubernetes.appViewMBean, operation: "findAppSummariesJson" }, onSuccess(onAppViewData));
        }
        function deleteApp(app, onCompleteFn) {
            function deleteServices(services, service, onCompletedFn) {
                if (!service || !services) {
                    return onCompletedFn();
                }
                var id = service.id;
                if (!id) {
                    Kubernetes.log.warn("No ID for service " + angular.toJson(service));
                }
                else {
                    KubernetesServices.then(function (KubernetesServices) {
                        KubernetesServices.delete({
                            id: id
                        }, undefined, function () {
                            Kubernetes.log.debug("Deleted service: ", id);
                            deleteServices(services, services.shift(), onCompletedFn);
                        }, function (error) {
                            Kubernetes.log.debug("Error deleting service: ", error);
                            deleteServices(services, services.shift(), onCompletedFn);
                        });
                    });
                }
            }
            function deleteReplicationControllers(replicationControllers, replicationController, onCompletedFn) {
                if (!replicationController || !replicationControllers) {
                    return onCompletedFn();
                }
                var id = replicationController.id;
                if (!id) {
                    Kubernetes.log.warn("No ID for replicationController " + angular.toJson(replicationController));
                }
                else {
                    KubernetesReplicationControllers.then(function (KubernetesReplicationControllers) {
                        KubernetesReplicationControllers.delete({
                            id: id
                        }, undefined, function () {
                            Kubernetes.log.debug("Deleted replicationController: ", id);
                            deleteReplicationControllers(replicationControllers, replicationControllers.shift(), onCompletedFn);
                        }, function (error) {
                            Kubernetes.log.debug("Error deleting replicationController: ", error);
                            deleteReplicationControllers(replicationControllers, replicationControllers.shift(), onCompletedFn);
                        });
                    });
                }
            }
            function deletePods(pods, pod, onCompletedFn) {
                if (!pod || !pods) {
                    return onCompletedFn();
                }
                var id = pod.id;
                if (!id) {
                    Kubernetes.log.warn("No ID for pod " + angular.toJson(pod));
                }
                else {
                    KubernetesPods.then(function (KubernetesPods) {
                        KubernetesPods.delete({
                            id: id
                        }, undefined, function () {
                            Kubernetes.log.debug("Deleted pod: ", id);
                            deletePods(pods, pods.shift(), onCompletedFn);
                        }, function (error) {
                            Kubernetes.log.debug("Error deleting pod: ", error);
                            deletePods(pods, pods.shift(), onCompletedFn);
                        });
                    });
                }
            }
            var services = [].concat(app.services);
            deleteServices(services, services.shift(), function () {
                var replicationControllers = [].concat(app.replicationControllers);
                deleteReplicationControllers(replicationControllers, replicationControllers.shift(), function () {
                    var pods = [].concat(app.pods);
                    deletePods(pods, pods.shift(), onCompleteFn);
                });
            });
        }
        $scope.deletePrompt = function (selected) {
            if (angular.isString(selected)) {
                selected = [{
                    id: selected
                }];
            }
            UI.multiItemConfirmActionDialog({
                collection: selected,
                index: '$name',
                onClose: function (result) {
                    if (result) {
                        function deleteSelected(selected, next) {
                            if (next) {
                                var id = next.name;
                                Kubernetes.log.debug("deleting: ", id);
                                deleteApp(next, function () {
                                    Kubernetes.log.debug("deleted: ", id);
                                    deleteSelected(selected, selected.shift());
                                });
                            }
                        }
                        deleteSelected(selected, selected.shift());
                    }
                },
                title: 'Delete Apps?',
                action: 'The following Apps will be deleted:',
                okText: 'Delete',
                okClass: 'btn-danger',
                custom: "This operation is permanent once completed!",
                customClass: "alert alert-warning"
            }).open();
        };
        $scope.appSelector = {
            filterText: "",
            folders: [],
            selectedApps: [],
            isOpen: function (folder) {
                if ($scope.appSelector.filterText !== '' || folder.expanded) {
                    return "opened";
                }
                return "closed";
            },
            getSelectedClass: function (app) {
                if (app.abstract) {
                    return "abstract";
                }
                if (app.selected) {
                    return "selected";
                }
                return "";
            },
            showApp: function (app) {
                return appMatches(app) && !appRunning(app);
            },
            showFolder: function (folder) {
                return !$scope.appSelector.filterText || folder.apps.some(function (app) { return appMatches(app) && !appRunning(app); });
            },
            clearSelected: function () {
                angular.forEach($scope.appSelector.folders, function (folder) {
                    angular.forEach(folder.apps, function (app) {
                        app.selected = false;
                    });
                });
                $scope.appSelector.selectedApps = [];
                Core.$apply($scope);
            },
            updateSelected: function () {
                // lets update the selected apps
                var selectedApps = [];
                angular.forEach($scope.appSelector.folders, function (folder) {
                    var apps = folder.apps.filter(function (app) { return app.selected; });
                    if (apps) {
                        selectedApps = selectedApps.concat(apps);
                    }
                });
                $scope.appSelector.selectedApps = selectedApps.sortBy("name");
            },
            select: function (app, flag) {
                app.selected = flag;
                $scope.appSelector.updateSelected();
            },
            hasSelection: function () {
                return $scope.appSelector.folders.any(function (folder) { return folder.apps.any(function (app) { return app.selected; }); });
            },
            runSelectedApps: function () {
                // lets run all the selected apps
                angular.forEach($scope.appSelector.selectedApps, function (app) {
                    var name = app.name;
                    var metadataPath = app.metadataPath;
                    if (metadataPath) {
                        // lets load the json/yaml
                        var url = Wiki.gitRelativeURL(branch, metadataPath);
                        if (url) {
                            $http.get(url).success(function (data, status, headers, config) {
                                if (data) {
                                    // lets convert the json object structure into a string
                                    var json = angular.toJson(data);
                                    var fn = function () {
                                    };
                                    Kubernetes.runApp($location, jolokia, $scope, json, name, fn, namespace);
                                }
                            }).error(function (data, status, headers, config) {
                                $scope.summaryHtml = null;
                                Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
                            });
                        }
                    }
                });
                // lets go back to the apps view
                $scope.appSelector.clearSelected();
                $scope.appSelectorShow = false;
            }
        };
        $scope.resizeDialog = {
            dialog: new UI.Dialog(),
            onOk: function () {
                $scope.resizeDialog.dialog.close();
                Kubernetes.resizeController($http, KubernetesApiURL, $scope.resize.controller.id, $scope.resize.newReplicas, function () {
                    // lets immediately update the replica count to avoid waiting for the next poll
                    $scope.resize.controller.replicas = $scope.resize.newReplicas;
                    Core.$apply($scope);
                });
            },
            open: function () {
                $scope.resizeDialog.dialog.open();
            },
            close: function () {
                $scope.resizeDialog.dialog.close();
            }
        };
        function updateData() {
            if ($scope.appInfos && $scope.appViews) {
                $scope.fetched = true;
                var folderMap = {};
                var folders = [];
                var appMap = {};
                angular.forEach($scope.appInfos, function (appInfo) {
                    var appPath = appInfo.appPath;
                    var iconPath = appInfo.iconPath;
                    if (iconPath) {
                        appInfo.$iconUrl = Wiki.gitRelativeURL(branch, iconPath);
                    }
                    else {
                        appInfo.$iconUrl = defaultIconUrl;
                    }
                    if (appPath) {
                        appMap[appPath] = appInfo;
                        var idx = appPath.lastIndexOf("/");
                        var folderPath = "";
                        if (idx >= 0) {
                            folderPath = appPath.substring(0, idx);
                        }
                        folderPath = Core.trimLeading(folderPath, "/");
                        var folder = folderMap[folderPath];
                        if (!folder) {
                            folder = {
                                path: folderPath,
                                expanded: true,
                                apps: []
                            };
                            folders.push(folder);
                            folderMap[folderPath] = folder;
                        }
                        folder.apps.push(appInfo);
                    }
                });
                $scope.appSelector.folders = folders.sortBy("path");
                var apps = [];
                var defaultInfo = {
                    $iconUrl: defaultIconUrl,
                    name: ""
                };
                angular.forEach($scope.appViews, function (appView) {
                    var appPath = appView.appPath;
                    appView.$info = defaultInfo;
                    appView.$select = function () {
                        Kubernetes.setJson($scope, appView.id, $scope.apps);
                    };
                    var appInfo = defaultInfo;
                    if (appPath) {
                        appInfo = appMap[appPath] || defaultInfo;
                    }
                    appView.$info = appInfo;
                    appView.id = appPath;
                    appView.$name = appInfo.name;
                    appView.$iconUrl = appInfo.$iconUrl;
                    appView.$appUrl = Wiki.viewLink(branch, appPath, $location);
                    appView.$openResizeControllerDialog = function (controller) {
                        $scope.resize = {
                            controller: controller,
                            newReplicas: controller.replicas
                        };
                        $scope.resizeDialog.dialog.open();
                        $timeout(function () {
                            $('#replicas').focus();
                        }, 50);
                    };
                    apps.push(appView);
                    appView.$podCounters = createAppViewPodCounters(appView);
                    appView.$serviceViews = createAppViewServiceViews(appView);
                });
                $scope.apps = apps;
                Core.$apply($scope);
            }
        }
        function createAppViewPodCounters(appView) {
            var array = [];
            var map = {};
            var pods = appView.pods;
            var lowestDate = null;
            angular.forEach(pods, function (pod) {
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
                var status = pod.status;
                if ("OK" === status) {
                    answer.valid += 1;
                }
                else if ("WAIT" === status) {
                    answer.waiting += 1;
                }
                else {
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
        function createAppViewServiceViews(appView) {
            var array = [];
            var pods = appView.pods;
            angular.forEach(pods, function (pod) {
                var id = pod.id;
                if (id) {
                    var abbrev = id;
                    var idx = id.indexOf("-");
                    if (idx > 1) {
                        abbrev = id.substring(0, idx);
                    }
                    pod.idAbbrev = abbrev;
                }
                pod.statusClass = Kubernetes.statusTextToCssClass(pod.status);
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
        function onAppData(response) {
            if (response) {
                var apps = response.value;
                var responseJson = angular.toJson(apps);
                if ($scope.responseAppJson === responseJson) {
                    return;
                }
                $scope.responseAppJson = responseJson;
                $scope.appInfos = apps;
                updateData();
            }
        }
        function onAppViewData(response) {
            if (response) {
                var responseJson = response.value;
                if ($scope.responseJson === responseJson) {
                    return;
                }
                var apps = [];
                if (responseJson) {
                    apps = JSON.parse(responseJson);
                }
                $scope.responseJson = responseJson;
                $scope.appViews = apps;
                updateData();
            }
        }
    }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.context = '/kubernetes';
    Kubernetes.hash = '#' + Kubernetes.context;
    Kubernetes.defaultRoute = Kubernetes.hash + '/apps';
    Kubernetes.pluginName = 'Kubernetes';
    Kubernetes.templatePath = 'app/kubernetes/html/';
    Kubernetes.log = Logger.get(Kubernetes.pluginName);
    Kubernetes.defaultApiVersion = "v1beta2";
    Kubernetes.appSuffix = ".app";
    Kubernetes.mbean = Fabric.jmxDomain + ":type=Kubernetes";
    Kubernetes.managerMBean = Fabric.jmxDomain + ":type=KubernetesManager";
    Kubernetes.appViewMBean = Fabric.jmxDomain + ":type=AppView";
    function isKubernetes(workspace) {
        return workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, { type: "Kubernetes" });
    }
    Kubernetes.isKubernetes = isKubernetes;
    function isKubernetesTemplateManager(workspace) {
        return workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, { type: "KubernetesTemplateManager" });
    }
    Kubernetes.isKubernetesTemplateManager = isKubernetesTemplateManager;
    function isAppView(workspace) {
        return workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, { type: "AppView" });
    }
    Kubernetes.isAppView = isAppView;
    /**
     * Updates the namespaces value in the kubernetes object from the namespace values in the pods, controllers, services
     */
    function updateNamespaces(kubernetes, pods, replicationControllers, services) {
        if (pods === void 0) { pods = []; }
        if (replicationControllers === void 0) { replicationControllers = []; }
        if (services === void 0) { services = []; }
        var byNamespace = function (thing) {
            return thing.namespace;
        };
        function pushIfNotExists(array, items) {
            angular.forEach(items, function (value) {
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
    Kubernetes.updateNamespaces = updateNamespaces;
    function setJson($scope, id, collection) {
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
        var item = collection.find(function (item) {
            return item.id === id;
        });
        if (item) {
            $scope.json = angular.toJson(item, true);
            $scope.item = item;
        }
        else {
            $scope.id = undefined;
            $scope.json = '';
            $scope.item = undefined;
        }
    }
    Kubernetes.setJson = setJson;
    /**
     * Returns the labels text string using the <code>key1=value1,key2=value2,....</code> format
     */
    function labelsToString(labels, seperatorText) {
        if (seperatorText === void 0) { seperatorText = ","; }
        var answer = "";
        angular.forEach(labels, function (value, key) {
            var separator = answer ? seperatorText : "";
            answer += separator + key + "=" + value;
        });
        return answer;
    }
    Kubernetes.labelsToString = labelsToString;
    function initShared($scope, $location) {
        // update the URL if the filter is changed
        $scope.$watch("tableConfig.filterOptions.filterText", function (text) {
            $location.search("q", text);
        });
        $scope.$on("labelFilterUpdate", function ($event, text) {
            var currentFilter = $scope.tableConfig.filterOptions.filterText;
            if (Core.isBlank(currentFilter)) {
                $scope.tableConfig.filterOptions.filterText = text;
            }
            else {
                var expressions = currentFilter.split(/\s+/);
                if (expressions.any(text)) {
                    // lets exclude this filter expression
                    expressions = expressions.remove(text);
                    $scope.tableConfig.filterOptions.filterText = expressions.join(" ");
                }
                else {
                    $scope.tableConfig.filterOptions.filterText = currentFilter + " " + text;
                }
            }
            $scope.id = undefined;
        });
    }
    Kubernetes.initShared = initShared;
    /**
     * Given the list of pods lets iterate through them and find all pods matching the selector
     * and return counters based on the status of the pod
     */
    function createPodCounters(selector, pods) {
        var answer = {
            podsLink: "",
            valid: 0,
            waiting: 0,
            error: 0
        };
        if (selector) {
            answer.podsLink = Core.url("/kubernetes/pods?q=" + encodeURIComponent(Kubernetes.labelsToString(selector, " ")));
            angular.forEach(pods, function (pod) {
                if (selectorMatches(selector, pod.labels)) {
                    var status = (pod.currentState || {}).status;
                    if (status) {
                        var lower = status.toLowerCase();
                        if (lower.startsWith("run")) {
                            answer.valid += 1;
                        }
                        else if (lower.startsWith("wait")) {
                            answer.waiting += 1;
                        }
                        else if (lower.startsWith("term") || lower.startsWith("error") || lower.startsWith("fail")) {
                            answer.error += 1;
                        }
                    }
                    else {
                        answer.error += 1;
                    }
                }
            });
        }
        return answer;
    }
    Kubernetes.createPodCounters = createPodCounters;
    /**
     * Runs the given application JSON
     */
    function runApp($location, jolokia, $scope, json, name, onSuccessFn, namespace) {
        if (name === void 0) { name = "App"; }
        if (onSuccessFn === void 0) { onSuccessFn = null; }
        if (namespace === void 0) { namespace = null; }
        if (json) {
            name = name || "App";
            var postfix = namespace ? " in namespace " + namespace : "";
            Core.notification('info', "Running " + name + postfix);
            var callback = onSuccess(function (response) {
                Kubernetes.log.debug("Got response: ", response);
                if (angular.isFunction(onSuccessFn)) {
                    onSuccessFn();
                }
                Core.$apply($scope);
            });
            if (namespace) {
                jolokia.execute(Kubernetes.managerMBean, "applyInNamespace", json, namespace, callback);
            }
            else {
                jolokia.execute(Kubernetes.managerMBean, "apply", json, callback);
            }
        }
    }
    Kubernetes.runApp = runApp;
    /**
     * Returns true if the current status of the pod is running
     */
    function isRunning(podCurrentState) {
        var status = (podCurrentState || {}).status;
        if (status) {
            var lower = status.toLowerCase();
            return lower.startsWith("run");
        }
        else {
            return false;
        }
    }
    Kubernetes.isRunning = isRunning;
    /**
     * Returns true if the labels object has all of the key/value pairs from the selector
     */
    function selectorMatches(selector, labels) {
        if (angular.isObject(labels)) {
            var answer = true;
            angular.forEach(selector, function (value, key) {
                if (answer && labels[key] !== value) {
                    answer = false;
                }
            });
            return answer;
        }
        else {
            return false;
        }
    }
    Kubernetes.selectorMatches = selectorMatches;
    /**
     * Returns a link to the kibana logs web application
     */
    function kibanaLogsLink(ServiceRegistry) {
        var link = Service.serviceLink(ServiceRegistry, "kibana-service");
        if (link) {
            if (!link.endsWith("/")) {
                link += "/";
            }
            return link + "#/discover/Fabric8";
        }
        else {
            return null;
        }
    }
    Kubernetes.kibanaLogsLink = kibanaLogsLink;
    function openLogsForPods(ServiceRegistry, $window, pods) {
        function encodePodIdInSearch(id) {
            // TODO until we figure out the best encoding lets just split at the "-"
            if (id) {
                var idx = id.indexOf("-");
                if (idx > 0) {
                    id = id.substring(0, idx);
                }
            }
            //var quoteText = "%27";
            var quoteText = "";
            return quoteText + id + quoteText;
        }
        var link = kibanaLogsLink(ServiceRegistry);
        if (link) {
            var query = "";
            var count = 0;
            angular.forEach(pods, function (item) {
                var id = item.id;
                if (id) {
                    var space = query ? " || " : "";
                    count++;
                    query += space + encodePodIdInSearch(id);
                }
            });
            if (query) {
                if (count > 1) {
                    query = "(" + query + ")";
                }
                link += "?_a=(query:'k8s_pod:" + query + "')";
            }
            var newWindow = $window.open(link, "viewLogs");
        }
    }
    Kubernetes.openLogsForPods = openLogsForPods;
    function resizeController($http, KubernetesApiURL, id, newReplicas, onCompleteFn) {
        if (onCompleteFn === void 0) { onCompleteFn = null; }
        KubernetesApiURL.then(function (KubernetesApiURL) {
            var url = UrlHelpers.join(KubernetesApiURL, "/api/v1beta1/replicationControllers/" + id);
            $http.get(url).success(function (data, status, headers, config) {
                if (data) {
                    var desiredState = data.desiredState;
                    if (!desiredState) {
                        desiredState = {};
                        data.desiredState = desiredState;
                    }
                    desiredState.replicas = newReplicas;
                    $http.put(url, data).success(function (data, status, headers, config) {
                        Kubernetes.log.debug("updated controller " + url);
                        if (angular.isFunction(onCompleteFn)) {
                            onCompleteFn();
                        }
                    }).error(function (data, status, headers, config) {
                        Kubernetes.log.warn("Failed to save " + url + " " + data + " " + status);
                    });
                }
            }).error(function (data, status, headers, config) {
                Kubernetes.log.warn("Failed to load " + url + " " + data + " " + status);
            });
        }, function (response) {
            Kubernetes.log.debug("Failed to get rest API URL, can't resize controller " + id + " resource: ", response);
        });
    }
    Kubernetes.resizeController = resizeController;
    function statusTextToCssClass(text) {
        if (text) {
            var lower = text.toLowerCase();
            if (lower.startsWith("run") || lower.startsWith("ok")) {
                return 'icon-play-circle green';
            }
            else if (lower.startsWith("wait")) {
                return 'icon-download';
            }
            else if (lower.startsWith("term") || lower.startsWith("error") || lower.startsWith("fail")) {
                return 'icon-off orange';
            }
        }
        return 'icon-question red';
    }
    Kubernetes.statusTextToCssClass = statusTextToCssClass;
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.KubernetesJsonDirective = Kubernetes._module.directive("kubernetesJson", [function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: Kubernetes.templatePath + 'kubernetesJsonDirective.html',
            scope: {
                config: '=kubernetesJson'
            },
            controller: ["$scope", "$location", "$http", "jolokia", "marked", function ($scope, $location, $http, jolokia, marked) {
                $scope.$watch('config', function (config) {
                    if (config) {
                        if (config.error) {
                            Kubernetes.log.debug("Error parsing kubernetes config: ", config.error);
                        }
                        else {
                            Kubernetes.log.debug("Got kubernetes configuration: ", config);
                        }
                    }
                    else {
                        Kubernetes.log.debug("Kubernetes config unset");
                    }
                });
                $scope.$on('Wiki.ViewPage.Children', function ($event, pageId, children) {
                    // log.debug("Got broadcast, pageId: ", pageId, " children: ", children);
                    $scope.appTitle = pageId;
                    if (children) {
                        var summaryFile = children.find(function (child) {
                            return child.name.toLowerCase() === "summary.md";
                        });
                        var summaryURL = null;
                        if (summaryFile) {
                            summaryURL = Wiki.gitRestURL(summaryFile.branch, summaryFile.path);
                            $http.get(summaryURL).success(function (data, status, headers, config) {
                                var summaryMarkdown = data;
                                if (summaryMarkdown) {
                                    $scope.summaryHtml = marked(summaryMarkdown);
                                }
                                else {
                                    $scope.summaryHtml = null;
                                }
                            }).error(function (data, status, headers, config) {
                                $scope.summaryHtml = null;
                                Kubernetes.log.warn("Failed to load " + summaryURL + " " + data + " " + status);
                            });
                        }
                        var iconFile = children.find(function (child) {
                            return child.name.toLowerCase().startsWith("icon");
                        });
                        if (iconFile) {
                            $scope.iconURL = Wiki.gitRestURL(iconFile.branch, iconFile.path);
                        }
                        var fabric8PropertiesFile = children.find(function (child) {
                            return child.name.toLowerCase() === "fabric8.properties";
                        });
                        var fabric8PropertiesURL = null;
                        if (fabric8PropertiesFile) {
                            fabric8PropertiesURL = Wiki.gitRestURL(fabric8PropertiesFile.branch, fabric8PropertiesFile.path);
                            $http.get(fabric8PropertiesURL).success(function (data, status, headers, config) {
                                var fabric8Properties = data;
                                if (fabric8Properties) {
                                    var nameRE = /(?:name)\s*=\s*(.+)[\n|$]/;
                                    var matches = fabric8Properties.match(nameRE);
                                    if (matches[1]) {
                                        $scope.displayName = matches[1].replace(/\\/g, '');
                                    }
                                }
                            }).error(function (data, status, headers, config) {
                                Kubernetes.log.warn("Failed to load " + fabric8PropertiesURL + " " + data + " " + status);
                            });
                        }
                    }
                });
                $scope.apply = function () {
                    var json = angular.toJson($scope.config);
                    var name = $scope.appTitle || "App";
                    Kubernetes.runApp($location, jolokia, $scope, json, name, function () {
                        // now lets navigate to the apps page so folks see things happen
                        $location.url("/kubernetes/apps");
                    });
                };
            }]
        };
    }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes._module = angular.module(Kubernetes.pluginName, ['hawtioCore', 'ngResource']);
    Kubernetes.controller = PluginHelpers.createControllerFunction(Kubernetes._module, Kubernetes.pluginName);
    Kubernetes.route = PluginHelpers.createRoutingFunction(Kubernetes.templatePath);
    Kubernetes._module.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(UrlHelpers.join(Kubernetes.context, '/pods'), Kubernetes.route('pods.html', false)).when(UrlHelpers.join(Kubernetes.context, '/namespace/:namespace/pods'), Kubernetes.route('pods.html', false)).when(UrlHelpers.join(Kubernetes.context, 'replicationControllers'), Kubernetes.route('replicationControllers.html', false)).when(UrlHelpers.join(Kubernetes.context, '/namespace/:namespace/replicationControllers'), Kubernetes.route('replicationControllers.html', false)).when(UrlHelpers.join(Kubernetes.context, 'services'), Kubernetes.route('services.html', false)).when(UrlHelpers.join(Kubernetes.context, '/namespace/:namespace/services'), Kubernetes.route('services.html', false)).when(UrlHelpers.join(Kubernetes.context, 'apps'), Kubernetes.route('apps.html', false)).when(UrlHelpers.join(Kubernetes.context, 'apps/:namespace'), Kubernetes.route('apps.html', false)).when(UrlHelpers.join(Kubernetes.context, 'overview'), Kubernetes.route('overview.html', false));
    }]);
    // set up a promise that supplies the API URL for Kubernetes, proxied if necessary
    Kubernetes._module.factory('KubernetesApiURL', ['jolokiaUrl', 'jolokia', '$q', '$rootScope', function (jolokiaUrl, jolokia, $q, $rootScope) {
        var answer = $q.defer();
        jolokia.getAttribute(Kubernetes.mbean, 'KubernetesAddress', undefined, onSuccess(function (response) {
            var proxified = UrlHelpers.maybeProxy(jolokiaUrl, response);
            Kubernetes.log.debug("discovered API URL:", proxified);
            answer.resolve(proxified);
            Core.$apply($rootScope);
        }, {
            error: function (response) {
                Kubernetes.log.debug("error fetching API URL: ", response);
                answer.reject(response);
                Core.$apply($rootScope);
            }
        }));
        return answer.promise;
    }]);
    function createResource(deferred, thing, urlTemplate) {
        var $rootScope = Core.injector.get("$rootScope");
        var $resource = Core.injector.get("$resource");
        var KubernetesApiURL = Core.injector.get("KubernetesApiURL");
        KubernetesApiURL.then(function (KubernetesApiURL) {
            var url = UrlHelpers.escapeColons(KubernetesApiURL);
            Kubernetes.log.debug("Url for ", thing, ": ", url);
            var resource = $resource(UrlHelpers.join(url, urlTemplate), null, {
                query: { method: 'GET', isArray: false },
                save: { method: 'PUT', params: { id: '@id' } }
            });
            deferred.resolve(resource);
            Core.$apply($rootScope);
        }, function (response) {
            Kubernetes.log.debug("Failed to get rest API URL, can't create " + thing + " resource: ", response);
            deferred.reject(response);
            Core.$apply($rootScope);
        });
    }
    Kubernetes._module.factory('KubernetesVersion', ['$q', function ($q) {
        var answer = $q.defer();
        createResource(answer, 'pods', '/version');
        return answer.promise;
    }]);
    Kubernetes._module.factory('KubernetesPods', ['$q', function ($q) {
        var answer = $q.defer();
        createResource(answer, 'pods', '/api/v1beta1/pods/:id');
        return answer.promise;
    }]);
    Kubernetes._module.factory('KubernetesReplicationControllers', ['$q', function ($q) {
        var answer = $q.defer();
        createResource(answer, 'replication controllers', '/api/v1beta1/replicationControllers/:id');
        return answer.promise;
    }]);
    Kubernetes._module.factory('KubernetesServices', ['$q', function ($q) {
        var answer = $q.defer();
        createResource(answer, 'services', '/api/v1beta1/services/:id');
        return answer.promise;
    }]);
    Kubernetes._module.factory('KubernetesState', [function () {
        return {
            namespaces: [],
            selectedNamespace: null
        };
    }]);
    Kubernetes._module.run(['viewRegistry', 'workspace', 'ServiceRegistry', function (viewRegistry, workspace, ServiceRegistry) {
        Kubernetes.log.debug("Running");
        viewRegistry['kubernetes'] = Kubernetes.templatePath + 'layoutKubernetes.html';
        workspace.topLevelTabs.push({
            id: 'kubernetes',
            content: 'Kubernetes',
            isValid: function (workspace) { return Kubernetes.isKubernetes(workspace); },
            isActive: function (workspace) { return workspace.isLinkActive('kubernetes'); },
            href: function () { return Kubernetes.defaultRoute; }
        });
        workspace.topLevelTabs.push({
            id: 'kibana',
            content: 'Logs',
            title: 'View and search all logs across all containers using Kibana and ElasticSearch',
            isValid: function (workspace) { return Service.hasService(ServiceRegistry, "kibana-service"); },
            href: function () { return Kubernetes.kibanaLogsLink(ServiceRegistry); },
            isActive: function (workspace) { return false; }
        });
        workspace.topLevelTabs.push({
            id: 'grafana',
            content: 'Metrics',
            title: 'Views metrics across all containers using Grafana and InfluxDB',
            isValid: function (workspace) { return Service.hasService(ServiceRegistry, "grafana-service"); },
            href: function () { return Service.serviceLink(ServiceRegistry, "grafana-service"); },
            isActive: function (workspace) { return false; }
        });
    }]);
    hawtioPluginLoader.addModule(Kubernetes.pluginName);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.FileDropController = Kubernetes.controller("FileDropController", ["$scope", "jolokiaUrl", "jolokia", "FileUploader", function ($scope, jolokiaUrl, jolokia, FileUploader) {
        $scope.uploader = new FileUploader({
            autoUpload: true,
            removeAfterUpload: true,
            url: jolokiaUrl
        });
        FileUpload.useJolokiaTransport($scope.uploader, jolokia, function (json) {
            Kubernetes.log.debug("Json: ", json);
            return {
                'type': 'exec',
                mbean: Kubernetes.managerMBean,
                operation: 'apply',
                arguments: [json]
            };
        });
        $scope.uploader.onBeforeUploadItem = function (item) {
            Core.notification('info', 'Uploading ' + item);
        };
        $scope.uploader.onSuccessItem = function (item) {
            Kubernetes.log.debug("onSuccessItem: ", item);
        };
        $scope.uploader.onErrorItem = function (item, response, status) {
            Kubernetes.log.debug("Failed to apply, response: ", response, " status: ", status);
        };
    }]);
    Kubernetes.TopLevel = Kubernetes.controller("TopLevel", ["$scope", "workspace", "KubernetesVersion", "KubernetesState", function ($scope, workspace, KubernetesVersion, KubernetesState) {
        $scope.version = undefined;
        $scope.showAppView = Kubernetes.isAppView(workspace);
        $scope.isActive = function (href) {
            return workspace.isLinkActive(href);
        };
        $scope.kubernetes = KubernetesState;
        KubernetesVersion.then(function (KubernetesVersion) {
            KubernetesVersion.query(function (response) {
                $scope.version = response;
            });
        });
    }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
var Kubernetes;
(function (Kubernetes) {
    var OverviewDirective = Kubernetes._module.directive("kubernetesOverview", ["$templateCache", "$compile", "$interpolate", "$timeout", "$window", "KubernetesState", function ($templateCache, $compile, $interpolate, $timeout, $window, KubernetesState) {
        return {
            restrict: 'E',
            replace: true,
            link: function (scope, element, attr) {
                element.css({ visibility: 'hidden' });
                scope.getEntity = function (type, key) {
                    switch (type) {
                        case 'host':
                            return scope.hostsByKey[key];
                        case 'pod':
                            return scope.podsByKey[key];
                        case 'replicationController':
                            return scope.replicationControllersByKey[key];
                        case 'service':
                            return scope.servicesByKey[key];
                        default:
                            return undefined;
                    }
                };
                scope.kubernetes = KubernetesState;
                scope.customizeDefaultOptions = function (options) {
                    options.Endpoint = ['Blank', {}];
                };
                scope.mouseEnter = function ($event) {
                    if (scope.jsPlumb) {
                        angular.element($event.currentTarget).addClass("hovered");
                        scope.jsPlumb.getEndpoints($event.currentTarget).forEach(function (endpoint) {
                            endpoint.connections.forEach(function (connection) {
                                if (!connection.isHover()) {
                                    connection.setHover(true);
                                    connection.endpoints.forEach(function (e) {
                                        scope.mouseEnter({
                                            currentTarget: e.element
                                        });
                                    });
                                }
                            });
                        });
                    }
                };
                scope.mouseLeave = function ($event) {
                    if (scope.jsPlumb) {
                        angular.element($event.currentTarget).removeClass("hovered");
                        scope.jsPlumb.getEndpoints($event.currentTarget).forEach(function (endpoint) {
                            endpoint.connections.forEach(function (connection) {
                                if (connection.isHover()) {
                                    connection.setHover(false);
                                    connection.endpoints.forEach(function (e) {
                                        scope.mouseLeave({
                                            currentTarget: e.element
                                        });
                                    });
                                }
                            });
                        });
                    }
                };
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
                scope.customizeConnectionOptions = function (jsPlumb, edge, params, options) {
                    var type = edge.source.el.attr('data-type');
                    options.connector = ["Bezier", { curviness: 50, stub: 25, alwaysRespectStubs: true }];
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
                                ["ContinuousLeft", {}],
                                ["ContinuousRight", { shape: "Rectangle" }]
                            ];
                            break;
                        case 'replicationController':
                            params.paintStyle = {
                                lineWidth: 2,
                                dashstyle: '2 2',
                                strokeStyle: '#44aa44'
                            };
                            /*
                            params.overlays = [
                              [ 'PlainArrow', { location: 1, width: 4, length: 4 } ]
                            ]
                            */
                            params.anchors = [
                                ["Perimeter", { shape: "Circle" }],
                                ["ContinuousRight", {}]
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
                    return things.map(function (thing) {
                        return createElement(template, thingName, thing);
                    });
                }
                function appendNewElements(parentEl, template, thingName, things) {
                    things.forEach(function (thing) {
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
                    Kubernetes.log.debug("First draw");
                    var services = scope.services;
                    var replicationControllers = scope.replicationControllers;
                    var pods = scope.pods;
                    var hosts = scope.hosts;
                    // log.debug("hosts: ", scope.hosts);
                    var parentEl = angular.element($templateCache.get("overviewTemplate.html"));
                    var servicesEl = parentEl.find(".services");
                    var hostsEl = parentEl.find(".hosts");
                    var replicationControllersEl = parentEl.find(".replicationControllers");
                    servicesEl.append(createElements($templateCache.get("serviceTemplate.html"), 'service', services.filter(namespaceFilter)));
                    replicationControllersEl.append(createElements($templateCache.get("replicationControllerTemplate.html"), 'replicationController', replicationControllers.filter(namespaceFilter)));
                    hosts.forEach(function (host) {
                        var hostEl = angular.element(createElement($templateCache.get("hostTemplate.html"), 'host', host));
                        var podContainer = angular.element(hostEl.find('.pod-container'));
                        podContainer.append(createElements($templateCache.get("podTemplate.html"), "pod", host.pods.filter(namespaceFilter)));
                        hostsEl.append(hostEl);
                    });
                    //parentEl.append(createElements($templateCache.get("podTemplate.html"), 'pod', pods));
                    element.append($compile(parentEl)(scope));
                    $timeout(function () {
                        element.css({ visibility: 'visible' });
                    }, 250);
                }
                function update() {
                    scope.$emit('jsplumbDoWhileSuspended', function () {
                        Kubernetes.log.debug("Update");
                        var services = scope.services.filter(namespaceFilter);
                        var replicationControllers = scope.replicationControllers.filter(namespaceFilter);
                        var pods = scope.pods.filter(namespaceFilter);
                        var hosts = scope.hosts;
                        var parentEl = element.find('[hawtio-jsplumb]');
                        var children = parentEl.find('.jsplumb-node');
                        children.each(function (index, c) {
                            var child = angular.element(c);
                            var key = child.attr('id');
                            if (Core.isBlank(key)) {
                                return;
                            }
                            var type = child.attr('data-type');
                            switch (type) {
                                case 'host':
                                    if (key in scope.hostsByKey) {
                                        return;
                                    }
                                    break;
                                case 'service':
                                    if (key in scope.servicesByKey && scope.servicesByKey[key].namespace == scope.kubernetes.selectedNamespace) {
                                        var service = scope.servicesByKey[key];
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
                                    if (key in scope.podsByKey && scope.podsByKey[key].namespace == scope.kubernetes.selectedNamespace) {
                                        return;
                                    }
                                    break;
                                case 'replicationController':
                                    if (key in scope.replicationControllersByKey && scope.replicationControllersByKey[key].namespace == scope.kubernetes.selectedNamespace) {
                                        var replicationController = scope.replicationControllersByKey[key];
                                        child.attr('connect-to', replicationController.connectTo);
                                        return;
                                    }
                                    break;
                                default:
                                    Kubernetes.log.debug("Ignoring element with unknown type");
                                    return;
                            }
                            Kubernetes.log.debug("Removing: ", key);
                            child.remove();
                        });
                        var servicesEl = parentEl.find(".services");
                        var hostsEl = parentEl.find(".hosts");
                        var replicationControllersEl = parentEl.find(".replicationControllers");
                        appendNewElements(servicesEl, $templateCache.get("serviceTemplate.html"), "service", services.filter(namespaceFilter));
                        appendNewElements(replicationControllersEl, $templateCache.get("replicationControllerTemplate.html"), "replicationController", replicationControllers.filter(namespaceFilter));
                        appendNewElements(hostsEl, $templateCache.get("hostTemplate.html"), "host", hosts);
                        hosts.forEach(function (host) {
                            var hostEl = parentEl.find("#" + host._key);
                            appendNewElements(hostEl, $templateCache.get("podTemplate.html"), "pod", host.pods.filter(namespaceFilter));
                        });
                    });
                }
                scope.$watch('count', function (count) {
                    if (count > 0) {
                        if (element.children().length === 0) {
                            firstDraw();
                        }
                        else {
                            update();
                        }
                    }
                });
            }
        };
    }]);
    var OverviewBoxController = Kubernetes.controller("OverviewBoxController", ["$scope", "$location", function ($scope, $location) {
        $scope.viewDetails = function (path) {
            $location.path(UrlHelpers.join('/kubernetes/namespace', $scope.entity.namespace, path)).search({ '_id': $scope.entity.id });
        };
    }]);
    var scopeName = "OverviewController";
    var OverviewController = Kubernetes.controller(scopeName, ["$scope", "$location", "KubernetesServices", "KubernetesPods", "KubernetesReplicationControllers", "KubernetesState", function ($scope, $location, KubernetesServices, KubernetesPods, KubernetesReplicationControllers, KubernetesState) {
        $scope.name = scopeName;
        $scope.kubernetes = KubernetesState;
        $scope.services = null;
        $scope.replicationControllers = null;
        $scope.pods = null;
        $scope.hosts = null;
        $scope.count = 0;
        var redraw = false;
        var services = [];
        var replicationControllers = [];
        var pods = [];
        var hosts = [];
        var byId = function (thing) {
            return thing.id;
        };
        function populateKey(item) {
            var result = item;
            result['_key'] = item.namespace + "-" + item.id;
            return result;
        }
        function populateKeys(items) {
            var result = [];
            angular.forEach(items, function (item) {
                result.push(populateKey(item));
            });
            return result;
        }
        ControllerHelpers.bindModelToSearchParam($scope, $location, 'kubernetes.selectedNamespace', 'namespace', undefined);
        KubernetesServices.then(function (KubernetesServices) {
            KubernetesReplicationControllers.then(function (KubernetesReplicationControllers) {
                KubernetesPods.then(function (KubernetesPods) {
                    $scope.fetch = PollHelpers.setupPolling($scope, function (next) {
                        var ready = 0;
                        var numServices = 3;
                        function maybeNext(count) {
                            ready = count;
                            // log.debug("Completed: ", ready);
                            if (ready >= numServices) {
                                // log.debug("Fetching another round");
                                maybeInit();
                                next();
                            }
                        }
                        KubernetesServices.query(function (response) {
                            if (response) {
                                var items = populateKeys((response.items || []).sortBy(byId));
                                redraw = ArrayHelpers.sync(services, items, "_key");
                            }
                            maybeNext(ready + 1);
                        });
                        KubernetesReplicationControllers.query(function (response) {
                            if (response) {
                                var items = populateKeys((response.items || []).sortBy(byId));
                                redraw = ArrayHelpers.sync(replicationControllers, items, "_key");
                            }
                            maybeNext(ready + 1);
                        });
                        KubernetesPods.query(function (response) {
                            if (response) {
                                var items = populateKeys((response.items || []).sortBy(byId));
                                redraw = ArrayHelpers.sync(pods, items, "_key");
                            }
                            maybeNext(ready + 1);
                        });
                    });
                    $scope.fetch();
                });
            });
        });
        function selectPods(pods, namespace, labels) {
            var matchFunc = _.matches(labels);
            return pods.filter(function (pod) {
                return pod.namespace === namespace && matchFunc(pod.labels, undefined, undefined);
            });
        }
        function maybeInit() {
            if (services && replicationControllers && pods) {
                $scope.servicesByKey = {};
                $scope.podsByKey = {};
                $scope.replicationControllersByKey = {};
                $scope.kubernetes.namespaces = {};
                services.forEach(function (service) {
                    $scope.servicesByKey[service._key] = service;
                    var selectedPods = selectPods(pods, service.namespace, service.selector);
                    service.connectTo = selectedPods.map(function (pod) {
                        return pod._key;
                    }).join(',');
                });
                replicationControllers.forEach(function (replicationController) {
                    $scope.replicationControllersByKey[replicationController._key] = replicationController;
                    var selectedPods = selectPods(pods, replicationController.namespace, replicationController.desiredState.replicaSelector);
                    replicationController.connectTo = selectedPods.map(function (pod) {
                        return pod._key;
                    }).join(',');
                });
                var hostsByKey = {};
                pods.forEach(function (pod) {
                    $scope.podsByKey[pod._key] = pod;
                    var host = pod.currentState.host;
                    hostsByKey[host] = hostsByKey[host] || [];
                    hostsByKey[host].push(pod);
                });
                var tmpHosts = [];
                var oldHostsLength = hosts.length;
                for (var hostKey in hostsByKey) {
                    tmpHosts.push({
                        id: hostKey,
                        pods: hostsByKey[hostKey]
                    });
                }
                redraw = ArrayHelpers.removeElements(hosts, tmpHosts);
                tmpHosts.forEach(function (newHost) {
                    var oldHost = hosts.find(function (h) {
                        return h.id === newHost.id;
                    });
                    if (!oldHost) {
                        redraw = true;
                        hosts.push(newHost);
                    }
                    else {
                        redraw = ArrayHelpers.sync(oldHost.pods, newHost.pods);
                    }
                });
                Kubernetes.updateNamespaces($scope.kubernetes, pods, replicationControllers, services);
                $scope.hosts = hosts;
                $scope.hostsByKey = hostsByKey;
                $scope.pods = pods;
                $scope.services = services;
                $scope.replicationControllers = replicationControllers;
                if (redraw) {
                    Kubernetes.log.debug("Redrawing");
                    $scope.count = $scope.count + 1;
                    redraw = false;
                }
            }
        }
    }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.EnvItem = Kubernetes.controller("EnvItem", ["$scope", function ($scope) {
        var parts = $scope.data.split('=');
        $scope.key = parts.shift();
        $scope.value = parts.join('=');
    }]);
    // main controller for the page
    Kubernetes.Pods = Kubernetes.controller("Pods", ["$scope", "KubernetesPods", "KubernetesState", "ServiceRegistry", "$dialog", "$window", "$templateCache", "$routeParams", "jolokia", "$location", "localStorage", function ($scope, KubernetesPods, KubernetesState, ServiceRegistry, $dialog, $window, $templateCache, $routeParams, jolokia, $location, localStorage) {
        $scope.namespace = $routeParams.namespace;
        $scope.pods = undefined;
        var pods = [];
        $scope.fetched = false;
        $scope.json = '';
        $scope.itemSchema = Forms.createFormConfiguration();
        $scope.kubernetes = KubernetesState;
        $scope.hasService = function (name) { return Service.hasService(ServiceRegistry, name); };
        $scope.tableConfig = {
            data: 'pods',
            showSelectionCheckbox: true,
            enableRowClickSelection: false,
            multiSelect: true,
            selectedItems: [],
            filterOptions: {
                filterText: $location.search()["q"] || ''
            },
            columnDefs: [
                {
                    field: 'id',
                    displayName: 'ID',
                    defaultSort: true,
                    cellTemplate: $templateCache.get("idTemplate.html")
                },
                {
                    field: 'currentState.status',
                    displayName: 'Status',
                    cellTemplate: $templateCache.get("statusTemplate.html")
                },
                {
                    field: 'containerImages',
                    displayName: 'Images',
                    cellTemplate: $templateCache.get("imageTemplate.html")
                },
                {
                    field: 'currentState.host',
                    displayName: 'Host'
                },
                {
                    field: 'currentState.podIP',
                    displayName: 'Pod IP'
                },
                {
                    field: 'labels',
                    displayName: 'Labels',
                    cellTemplate: $templateCache.get("labelTemplate.html")
                },
                {
                    field: 'namespace',
                    displayName: 'Namespace'
                }
            ]
        };
        $scope.podDetail = {
            properties: {
                'manifest/containers/image$': {
                    template: $templateCache.get('imageTemplate.html')
                },
                'currentState/status': {
                    template: $templateCache.get('statusTemplate.html')
                },
                '\\/Env\\/': {
                    template: $templateCache.get('envItemTemplate.html')
                },
                '^\\/labels$': {
                    template: $templateCache.get('labelTemplate.html')
                },
                '\\/env\\/key$': {
                    hidden: true
                }
            }
        };
        ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);
        $scope.openLogs = function () {
            var pods = $scope.tableConfig.selectedItems;
            if (!pods || !pods.length) {
                if ($scope.id) {
                    var item = $scope.item;
                    if (item) {
                        pods = [item];
                    }
                }
            }
            Kubernetes.openLogsForPods(ServiceRegistry, $window, pods);
        };
        $scope.$on('kubeSelectedId', function ($event, id) {
            Kubernetes.setJson($scope, id, $scope.pods);
        });
        $scope.$on('$routeUpdate', function ($event) {
            Kubernetes.setJson($scope, $location.search()['_id'], $scope.pods);
        });
        jolokia.getAttribute(Kubernetes.mbean, 'DockerIp', undefined, onSuccess(function (results) {
            Kubernetes.log.info("got Docker IP: " + results);
            if (results) {
                $scope.dockerIp = results;
            }
            Core.$apply($scope);
        }, {
            error: function (response) {
                Kubernetes.log.debug("error fetching API URL: ", response);
            }
        }));
        jolokia.getAttribute(Kubernetes.mbean, 'HostName', undefined, onSuccess(function (results) {
            Kubernetes.log.info("got hostname: " + results);
            if (results) {
                $scope.hostName = results;
            }
            Core.$apply($scope);
        }, {
            error: function (response) {
                Kubernetes.log.debug("error fetching API URL: ", response);
            }
        }));
        Kubernetes.initShared($scope, $location);
        $scope.connect = {
            dialog: new UI.Dialog(),
            saveCredentials: false,
            userName: null,
            password: null,
            jolokiaUrl: null,
            containerName: null,
            view: null,
            onOK: function () {
                var userName = $scope.connect.userName;
                var password = $scope.connect.password;
                var userDetails = Core.injector.get('userDetails');
                if (!userDetails.password) {
                    // this can get unset if the user happens to refresh and hasn't checked rememberMe
                    userDetails.password = password;
                }
                if ($scope.connect.saveCredentials) {
                    $scope.connect.saveCredentials = false;
                    if (userName) {
                        localStorage['kuberentes.userName'] = userName;
                    }
                    if (password) {
                        localStorage['kuberentes.password'] = password;
                    }
                }
                Kubernetes.log.info("Connecting to " + $scope.connect.jolokiaUrl + " for container: " + $scope.connect.containerName + " user: " + $scope.connect.userName);
                var options = Core.createConnectOptions({
                    jolokiaUrl: $scope.connect.jolokiaUrl,
                    userName: userName,
                    password: password,
                    useProxy: true,
                    view: $scope.connect.view,
                    name: $scope.connect.containerName
                });
                Core.connectToServer(localStorage, options);
                setTimeout(function () {
                    $scope.connect.dialog.close();
                    Core.$apply($scope);
                }, 100);
            },
            doConnect: function (entity) {
                var userDetails = Core.injector.get('userDetails');
                if (userDetails) {
                    $scope.connect.userName = userDetails.username;
                    $scope.connect.password = userDetails.password;
                }
                $scope.connect.jolokiaUrl = entity.$jolokiaUrl;
                $scope.connect.containerName = entity.id;
                //$scope.connect.view = "#/openlogs";
                var alwaysPrompt = localStorage['fabricAlwaysPrompt'];
                if ((alwaysPrompt && alwaysPrompt !== "false") || !$scope.connect.userName || !$scope.connect.password) {
                    $scope.connect.dialog.open();
                }
                else {
                    $scope.connect.onOK();
                }
            }
        };
        KubernetesPods.then(function (KubernetesPods) {
            $scope.deletePrompt = function (selected) {
                if (angular.isString(selected)) {
                    selected = [{
                        id: selected
                    }];
                }
                UI.multiItemConfirmActionDialog({
                    collection: selected,
                    index: 'id',
                    onClose: function (result) {
                        if (result) {
                            function deleteSelected(selected, next) {
                                if (!next) {
                                    if (!jolokia.isRunning()) {
                                        $scope.fetch();
                                    }
                                }
                                else {
                                    Kubernetes.log.debug("deleting: ", next.id);
                                    KubernetesPods.delete({
                                        id: next.id
                                    }, undefined, function () {
                                        Kubernetes.log.debug("deleted: ", next.id);
                                        deleteSelected(selected, selected.shift());
                                    }, function (error) {
                                        Kubernetes.log.debug("Error deleting: ", error);
                                        deleteSelected(selected, selected.shift());
                                    });
                                }
                            }
                            deleteSelected(selected, selected.shift());
                        }
                    },
                    title: 'Delete pods?',
                    action: 'The following pods will be deleted:',
                    okText: 'Delete',
                    okClass: 'btn-danger',
                    custom: "This operation is permanent once completed!",
                    customClass: "alert alert-warning"
                }).open();
            };
            // setup polling
            $scope.fetch = PollHelpers.setupPolling($scope, function (next) {
                KubernetesPods.query(function (response) {
                    $scope.fetched = true;
                    var redraw = ArrayHelpers.sync(pods, (response['items'] || []).sortBy(function (pod) {
                        return pod.id;
                    }).filter(function (pod) {
                        return pod.id && (!$scope.namespace || $scope.namespace === pod.namespace);
                    }));
                    angular.forEach(pods, function (entity) {
                        entity.$labelsText = Kubernetes.labelsToString(entity.labels);
                        // lets try detect a console...
                        var info = Core.pathGet(entity, ["currentState", "info"]);
                        var hostPort = null;
                        var currentState = entity.currentState || {};
                        var desiredState = entity.desiredState || {};
                        var host = currentState["host"];
                        var podIP = currentState["podIP"];
                        var hasDocker = false;
                        var foundContainerPort = null;
                        if (currentState && !podIP) {
                            angular.forEach(info, function (containerInfo, containerName) {
                                if (!hostPort) {
                                    var jolokiaHostPort = Core.pathGet(containerInfo, ["detailInfo", "HostConfig", "PortBindings", "8778/tcp"]);
                                    if (jolokiaHostPort) {
                                        var hostPorts = jolokiaHostPort.map("HostPort");
                                        if (hostPorts && hostPorts.length > 0) {
                                            hostPort = hostPorts[0];
                                            hasDocker = true;
                                        }
                                    }
                                }
                            });
                        }
                        if (desiredState && !hostPort) {
                            var containers = Core.pathGet(desiredState, ["manifest", "containers"]);
                            angular.forEach(containers, function (container) {
                                if (!hostPort) {
                                    var ports = container.ports;
                                    angular.forEach(ports, function (port) {
                                        if (!hostPort) {
                                            var containerPort = port.containerPort;
                                            var portName = port.name;
                                            var containerHostPort = port.hostPort;
                                            if (containerPort === 8778 || "jolokia" === portName) {
                                                if (containerPort) {
                                                    if (podIP) {
                                                        foundContainerPort = containerPort;
                                                    }
                                                    if (containerHostPort) {
                                                        hostPort = containerHostPort;
                                                    }
                                                }
                                            }
                                        }
                                    });
                                }
                            });
                        }
                        if (podIP && foundContainerPort) {
                            host = podIP;
                            hostPort = foundContainerPort;
                            hasDocker = false;
                        }
                        if (hostPort) {
                            if (!host) {
                                host = "localhost";
                            }
                            // if Kubernetes is running locally on a platform which doesn't support docker natively
                            // then docker containers will be on a different IP so lets check for localhost and
                            // switch to the docker IP if its available
                            if ($scope.dockerIp && hasDocker) {
                                if (host === "localhost" || host === "127.0.0.1" || host === $scope.hostName) {
                                    host = $scope.dockerIp;
                                }
                            }
                            if (Kubernetes.isRunning(currentState)) {
                                entity.$jolokiaUrl = "http://" + host + ":" + hostPort + "/jolokia/";
                                // TODO note if we can't access the docker/local host we could try access via
                                // the pod IP; but typically you need to explicitly enable that inside boot2docker
                                // see: https://github.com/fabric8io/fabric8/blob/2.0/docs/getStarted.md#if-you-are-on-a-mac
                                entity.$connect = $scope.connect;
                            }
                        }
                    });
                    Kubernetes.setJson($scope, $scope.id, pods);
                    $scope.pods = pods.filter(function (item) {
                        return item.namespace === $scope.kubernetes.selectedNamespace;
                    });
                    Kubernetes.updateNamespaces($scope.kubernetes, pods);
                    // technically the above won't trigger hawtio simple table's watch, so let's force it
                    $scope.$broadcast("hawtio.datatable.pods");
                    //log.debug("Pods: ", $scope.pods);
                    next();
                });
            });
            // kick off polling
            $scope.fetch();
        });
    }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.DesiredReplicas = Kubernetes.controller("DesiredReplicas", ["$scope", function ($scope) {
        var watch = null;
        var originalValue = null;
        $scope.$watch('row.entity', function (entity) {
            // log.debug("entity updated: ", entity);
            if (watch && angular.isFunction(watch)) {
                originalValue = null;
                watch();
            }
            watch = $scope.$watch('row.entity.desiredState.replicas', function (replicas) {
                if (originalValue === null && replicas !== undefined) {
                    originalValue = replicas;
                }
                if (replicas < 0) {
                    $scope.row.entity.desiredState.replicas = 0;
                }
                if (replicas !== originalValue) {
                    $scope.$emit('kubernetes.dirtyController', $scope.row.entity);
                }
                else {
                    $scope.$emit('kubernetes.cleanController', $scope.row.entity);
                }
                Core.$apply($scope);
                // log.debug("Replicas: ", replicas, " original value: ", originalValue);
            });
        });
        $scope.$on('kubernetes.resetReplicas', function ($event) {
            $scope.row.entity.desiredState.replicas = originalValue;
        });
    }]);
    Kubernetes.ReplicationControllers = Kubernetes.controller("ReplicationControllers", ["$scope", "KubernetesReplicationControllers", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "jolokia", function ($scope, KubernetesReplicationControllers, KubernetesPods, KubernetesState, $templateCache, $location, $routeParams, jolokia) {
        $scope.namespace = $routeParams.namespace;
        $scope.kubernetes = KubernetesState;
        $scope.replicationControllers = [];
        $scope.allReplicationControllers = [];
        var pods = [];
        $scope.fetched = false;
        $scope.json = '';
        ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);
        $scope.detailConfig = {
            properties: {
                '^\\/labels$': {
                    template: $templateCache.get('labelTemplate.html')
                }
            }
        };
        $scope.tableConfig = {
            data: 'replicationControllers',
            showSelectionCheckbox: true,
            enableRowClickSelection: false,
            multiSelect: true,
            selectedItems: [],
            filterOptions: {
                filterText: $location.search()["q"] || ''
            },
            columnDefs: [
                { field: 'icon', displayName: '', cellTemplate: $templateCache.get("iconCellTemplate.html") },
                { field: 'id', displayName: 'ID', cellTemplate: $templateCache.get("idTemplate.html") },
                { field: 'currentState.replicas', displayName: 'Pods', cellTemplate: $templateCache.get("podCountsAndLinkTemplate.html") },
                { field: 'desiredState.replicas', displayName: 'Replicas', cellTemplate: $templateCache.get("desiredReplicas.html") },
                { field: 'labelsText', displayName: 'Labels', cellTemplate: $templateCache.get("labelTemplate.html") },
                { field: 'namespace', displayName: 'Namespace' }
            ]
        };
        Kubernetes.initShared($scope, $location);
        function updatePodCounts() {
            // lets iterate through the services and update the counts for the pods
            angular.forEach($scope.replicationControllers, function (replicationController) {
                var selector = (replicationController.desiredState || {}).replicaSelector;
                replicationController.$podCounters = selector ? Kubernetes.createPodCounters(selector, pods) : null;
            });
            Kubernetes.updateNamespaces($scope.kubernetes, pods, $scope.allReplicationControllers);
        }
        $scope.$on('kubernetes.dirtyController', function ($event, replicationController) {
            replicationController.$dirty = true;
            //log.debug("Replication controller is dirty: ", replicationController, " all replication controllers: ", $scope.replicationControllers);
        });
        $scope.$on('kubernetes.cleanController', function ($event, replicationController) {
            replicationController.$dirty = false;
        });
        $scope.anyDirty = function () {
            return $scope.replicationControllers.any(function (controller) {
                return controller.$dirty;
            });
        };
        $scope.undo = function () {
            $scope.$broadcast('kubernetes.resetReplicas');
        };
        /*$scope.$watch('anyDirty()', (dirty) => {
          log.debug("Dirty controllers: ", dirty);
        });*/
        $scope.$on('kubeSelectedId', function ($event, id) {
            Kubernetes.setJson($scope, id, $scope.replicationControllers);
        });
        $scope.$on('$routeUpdate', function ($event) {
            Kubernetes.setJson($scope, $location.search()['_id'], $scope.pods);
        });
        KubernetesReplicationControllers.then(function (KubernetesReplicationControllers) {
            KubernetesPods.then(function (KubernetesPods) {
                $scope.save = function () {
                    var dirtyControllers = $scope.replicationControllers.filter(function (controller) {
                        return controller.$dirty;
                    });
                    if (dirtyControllers.length) {
                        dirtyControllers.forEach(function (replicationController) {
                            var apiVersion = replicationController["apiVersion"];
                            if (!apiVersion) {
                                replicationController["apiVersion"] = Kubernetes.defaultApiVersion;
                            }
                            KubernetesReplicationControllers.save(undefined, replicationController, function () {
                                replicationController.$dirty = false;
                                Kubernetes.log.debug("Updated ", replicationController.id);
                            }, function (error) {
                                replicationController.$dirty = false;
                                Kubernetes.log.debug("Failed to update ", replicationController.id, " error: ", error);
                            });
                        });
                    }
                };
                $scope.deletePrompt = function (selected) {
                    if (angular.isString(selected)) {
                        selected = [{
                            id: selected
                        }];
                    }
                    UI.multiItemConfirmActionDialog({
                        collection: selected,
                        index: 'id',
                        onClose: function (result) {
                            if (result) {
                                function deleteSelected(selected, next) {
                                    if (!next) {
                                        if (!jolokia.isRunning()) {
                                            $scope.fetch();
                                        }
                                    }
                                    else {
                                        Kubernetes.log.debug("deleting: ", next.id);
                                        KubernetesReplicationControllers.delete({
                                            id: next.id
                                        }, undefined, function () {
                                            Kubernetes.log.debug("deleted: ", next.id);
                                            deleteSelected(selected, selected.shift());
                                        }, function (error) {
                                            Kubernetes.log.debug("Error deleting: ", error);
                                            deleteSelected(selected, selected.shift());
                                        });
                                    }
                                }
                                deleteSelected(selected, selected.shift());
                            }
                        },
                        title: 'Delete replication controllers?',
                        action: 'The following replication controllers will be deleted:',
                        okText: 'Delete',
                        okClass: 'btn-danger',
                        custom: "This operation is permanent once completed!",
                        customClass: "alert alert-warning"
                    }).open();
                };
                $scope.fetch = PollHelpers.setupPolling($scope, function (next) {
                    var ready = 0;
                    var numServices = 2;
                    function maybeNext(count) {
                        ready = count;
                        // log.debug("Completed: ", ready);
                        if (ready >= numServices) {
                            // log.debug("Fetching another round");
                            maybeInit();
                            next();
                        }
                    }
                    KubernetesReplicationControllers.query(function (response) {
                        //log.debug("got back response: ", response);
                        $scope.fetched = true;
                        if ($scope.anyDirty()) {
                            Kubernetes.log.debug("Table has been changed, not updating local view");
                            next();
                            return;
                        }
                        $scope.allReplicationControllers = (response['items'] || []).sortBy(function (item) {
                            return item.id;
                        });
                        $scope.replicationControllers = $scope.allReplicationControllers.filter(function (item) {
                            return !$scope.kubernetes.selectedNamespace || $scope.kubernetes.selectedNamespace === item.namespace;
                        });
                        angular.forEach($scope.replicationControllers, function (entity) {
                            entity.$labelsText = Kubernetes.labelsToString(entity.labels);
                            var desiredState = entity.desiredState || {};
                            var replicaSelector = desiredState.replicaSelector;
                            if (replicaSelector) {
                                entity.podsLink = Core.url("/kubernetes/pods?q=" + encodeURIComponent(Kubernetes.labelsToString(replicaSelector, " ")));
                            }
                        });
                        Kubernetes.setJson($scope, $scope.id, $scope.replicationControllers);
                        updatePodCounts();
                        maybeNext(ready + 1);
                    });
                    KubernetesPods.query(function (response) {
                        ArrayHelpers.sync(pods, (response['items'] || []).filter(function (pod) {
                            return pod.id && (!$scope.namespace || $scope.namespace === pod.namespace);
                        }));
                        updatePodCounts();
                        maybeNext(ready + 1);
                    });
                });
                $scope.fetch();
            });
        });
        function maybeInit() {
        }
        /*$scope.$watch('replicationControllers', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            log.debug("replicationControllers: ", newValue);
          }
        });*/
    }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
var Kubernetes;
(function (Kubernetes) {
    Kubernetes.Services = Kubernetes.controller("Services", ["$scope", "KubernetesServices", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "jolokia", function ($scope, KubernetesServices, KubernetesPods, KubernetesState, $templateCache, $location, $routeParams, jolokia) {
        $scope.namespace = $routeParams.namespace;
        $scope.services = [];
        $scope.allServices = [];
        $scope.kubernetes = KubernetesState;
        var pods = [];
        $scope.fetched = false;
        $scope.json = '';
        ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);
        $scope.tableConfig = {
            data: 'services',
            showSelectionCheckbox: true,
            enableRowClickSelection: false,
            multiSelect: true,
            selectedItems: [],
            filterOptions: {
                filterText: $location.search()["q"] || ''
            },
            columnDefs: [
                { field: 'icon', displayName: '', cellTemplate: $templateCache.get("iconCellTemplate.html") },
                { field: 'id', displayName: 'ID', cellTemplate: $templateCache.get("idTemplate.html") },
                { field: '$podsLink', displayName: 'Pods', cellTemplate: $templateCache.get("podCountsAndLinkTemplate.html") },
                { field: 'selector', displayName: 'Selector', cellTemplate: $templateCache.get("selectorTemplate.html") },
                { field: 'portalIP', displayName: 'Address', cellTemplate: $templateCache.get("portalAddress.html") },
                { field: 'labelsText', displayName: 'Labels', cellTemplate: $templateCache.get("labelTemplate.html") },
                { field: 'namespace', displayName: 'Namespace' }
            ]
        };
        Kubernetes.initShared($scope, $location);
        $scope.$on('kubeSelectedId', function ($event, id) {
            Kubernetes.setJson($scope, id, $scope.services);
        });
        $scope.$on('$routeUpdate', function ($event) {
            Kubernetes.setJson($scope, $location.search()['_id'], $scope.pods);
        });
        function updatePodCounts() {
            // lets iterate through the services and update the counts for the pods
            angular.forEach($scope.services, function (service) {
                var selector = service.selector;
                service.$podCounters = selector ? Kubernetes.createPodCounters(selector, pods) : null;
            });
            Kubernetes.updateNamespaces($scope.kubernetes, pods, [], $scope.allServices);
        }
        KubernetesServices.then(function (KubernetesServices) {
            KubernetesPods.then(function (KubernetesPods) {
                $scope.deletePrompt = function (selected) {
                    if (angular.isString(selected)) {
                        selected = [{
                            id: selected
                        }];
                    }
                    UI.multiItemConfirmActionDialog({
                        collection: selected,
                        index: 'id',
                        onClose: function (result) {
                            if (result) {
                                function deleteSelected(selected, next) {
                                    if (!next) {
                                        if (!jolokia.isRunning()) {
                                            $scope.fetch();
                                        }
                                    }
                                    else {
                                        Kubernetes.log.debug("deleting: ", next.id);
                                        KubernetesServices.delete({
                                            id: next.id
                                        }, undefined, function () {
                                            Kubernetes.log.debug("deleted: ", next.id);
                                            deleteSelected(selected, selected.shift());
                                        }, function (error) {
                                            Kubernetes.log.debug("Error deleting: ", error);
                                            deleteSelected(selected, selected.shift());
                                        });
                                    }
                                }
                                deleteSelected(selected, selected.shift());
                            }
                        },
                        title: 'Delete services?',
                        action: 'The following services will be deleted:',
                        okText: 'Delete',
                        okClass: 'btn-danger',
                        custom: "This operation is permanent once completed!",
                        customClass: "alert alert-warning"
                    }).open();
                };
                $scope.fetch = PollHelpers.setupPolling($scope, function (next) {
                    var ready = 0;
                    var numServices = 2;
                    function maybeNext(count) {
                        ready = count;
                        // log.debug("Completed: ", ready);
                        if (ready >= numServices) {
                            // log.debug("Fetching another round");
                            maybeInit();
                            next();
                        }
                    }
                    KubernetesServices.query(function (response) {
                        $scope.fetched = true;
                        $scope.allServices = (response['items'] || []).sortBy(function (item) {
                            return item.id;
                        });
                        $scope.services = $scope.allServices.filter(function (item) {
                            return !$scope.kubernetes.selectedNamespace || $scope.kubernetes.selectedNamespace === item.namespace;
                        });
                        Kubernetes.setJson($scope, $scope.id, $scope.services);
                        angular.forEach($scope.services, function (entity) {
                            entity.$labelsText = Kubernetes.labelsToString(entity.labels);
                        });
                        updatePodCounts();
                        maybeNext(ready + 1);
                    });
                    KubernetesPods.query(function (response) {
                        ArrayHelpers.sync(pods, (response['items'] || []).filter(function (pod) {
                            return pod.id && (!$scope.namespace || $scope.namespace === pod.namespace);
                        }));
                        updatePodCounts();
                        maybeNext(ready + 1);
                    });
                });
                $scope.fetch();
            });
        });
        function maybeInit() {
        }
    }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
var Kubernetes;
(function (Kubernetes) {
    // controller that maps a docker image to an icon path in the if possible
    var ReplicationControllerIcon = Kubernetes.controller("ReplicationControllerIcon", ["$scope", "jolokia", function ($scope, jolokia) {
        $scope.iconUrl = 'img/icons/kubernetes.svg';
        jolokia.request({
            type: 'exec',
            mbean: Kubernetes.mbean,
            operation: "iconPath(java.lang.String,java.lang.String)",
            arguments: ['master', $scope.entity.id]
        }, onSuccess(function (response) {
            if (response.value) {
                $scope.iconUrl = Wiki.gitRelativeURL('master', response.value);
                Core.$apply($scope);
            }
        }));
    }]);
    // controller that handles the 'id' field of a given view
    Kubernetes.IDSelector = Kubernetes.controller("IDSelector", ["$scope", function ($scope) {
        $scope.select = function (id) {
            $scope.$emit('kubeSelectedId', id);
        };
    }]);
    // controller for the status icon cell
    Kubernetes.PodStatus = Kubernetes.controller("PodStatus", ["$scope", function ($scope) {
        $scope.statusMapping = function (text) {
            return Kubernetes.statusTextToCssClass(text);
        };
    }]);
    // controller that deals with the labels per pod
    Kubernetes.Labels = Kubernetes.controller("Labels", ["$scope", "workspace", "jolokia", "$location", function ($scope, workspace, jolokia, $location) {
        $scope.labels = [];
        var labelKeyWeights = {
            "name": 1,
            "replicationController": 2,
            "group": 3
        };
        $scope.$watch('entity', function (newValue, oldValue) {
            if (newValue) {
                // log.debug("labels: ", newValue);
                // massage the labels a bit
                $scope.labels = [];
                angular.forEach($scope.entity.labels, function (value, key) {
                    if (key === 'fabric8') {
                        // TODO not sure what this is for, the container type?
                        return;
                    }
                    $scope.labels.push({
                        key: key,
                        title: value
                    });
                });
                //  lets sort by key but lets make sure that we weight certain labels so they are first
                $scope.labels = $scope.labels.sort(function (a, b) {
                    function getWeight(key) {
                        return labelKeyWeights[key] || 1000;
                    }
                    var n1 = a["key"];
                    var n2 = b["key"];
                    var w1 = getWeight(n1);
                    var w2 = getWeight(n2);
                    var diff = w1 - w2;
                    if (diff < 0) {
                        return -1;
                    }
                    else if (diff > 0) {
                        return 1;
                    }
                    if (n1 && n2) {
                        if (n1 > n2) {
                            return 1;
                        }
                        else if (n1 < n2) {
                            return -1;
                        }
                        else {
                            return 0;
                        }
                    }
                    else {
                        if (n1 === n2) {
                            return 0;
                        }
                        else if (n1) {
                            return 1;
                        }
                        else {
                            return -1;
                        }
                    }
                });
            }
        });
        $scope.handleClick = function (entity, labelType, value) {
            // log.debug("handleClick, entity: ", entity, " key: ", labelType, " value: ", value);
            var filterTextSection = labelType + "=" + value.title;
            $scope.$emit('labelFilterUpdate', filterTextSection);
        };
        var labelColors = {
            'version': 'background-blue',
            'name': 'background-light-green',
            'container': 'background-light-grey'
        };
        $scope.labelClass = function (labelType) {
            if (!(labelType in labelColors)) {
                return 'mouse-pointer';
            }
            else
                return labelColors[labelType] + ' mouse-pointer';
        };
    }]);
})(Kubernetes || (Kubernetes = {}));

/// <reference path="../../includes.ts"/>
var Service;
(function (Service) {
    Service.pluginName = 'Service';
    Service.log = Logger.get(Service.pluginName);
    /**
     * Used to specify whether the "service" URL should be polled for services using kubernetes or kubernetes-like service discover.
     * For more details see: https://github.com/hawtio/hawtio/blob/master/docs/Services.md
     */
    Service.pollServices = false;
    /**
     * Returns true if there is a service available for the given ID or false
     */
    function hasService(ServiceRegistry, serviceName) {
        if (!ServiceRegistry || !serviceName) {
            return false;
        }
        var answer = false;
        angular.forEach(ServiceRegistry.services, function (service) {
            if (serviceName === service.id) {
                answer = true;
            }
        });
        return answer;
    }
    Service.hasService = hasService;
    /**
     * Returns the service for the given service name (ID) or null if it cannot be found
     *
     * @param ServiceRegistry
     * @param serviceName
     * @return {null}
     */
    function findService(ServiceRegistry, serviceName) {
        var answer = null;
        if (ServiceRegistry && serviceName) {
            angular.forEach(ServiceRegistry.services, function (service) {
                if (serviceName === service.id) {
                    answer = service;
                }
            });
        }
        return answer;
    }
    Service.findService = findService;
    /**
     * Returns the service link for the given service name
     *
     * @param ServiceRegistry
     * @param serviceName
     * @return {null}
     */
    function serviceLink(ServiceRegistry, serviceName) {
        var service = findService(ServiceRegistry, serviceName);
        if (service) {
            var portalIP = service.portalIP;
            var port = service.port;
            // TODO use annotations to support other kinds of protocol?
            var protocol = "http://";
            if (portalIP) {
                if (port) {
                    return protocol + portalIP + ":" + port + "/";
                }
                else {
                    return protocol + portalIP;
                }
            }
        }
        return "";
    }
    Service.serviceLink = serviceLink;
})(Service || (Service = {}));

/// <reference path="serviceHelpers.ts"/>
/// <reference path="../../includes.ts"/>
var Service;
(function (Service) {
    Service._module = angular.module(Service.pluginName, ['hawtioCore']);
    Service._module.factory("ServiceRegistry", ['$http', '$rootScope', 'workspace', function ($http, $rootScope, workspace) {
        var self = {
            name: 'ServiceRegistry',
            services: [],
            fetch: function (next) {
                if (Kubernetes.isKubernetesTemplateManager(workspace) || Service.pollServices) {
                    $http({
                        method: 'GET',
                        url: 'service'
                    }).success(function (data, status, headers, config) {
                        self.onSuccessfulPoll(next, data, status, headers, config);
                    }).error(function (data, status, headers, config) {
                        self.onFailedPoll(next, data, status, headers, config);
                    });
                }
            },
            onSuccessfulPoll: function (next, data, status, headers, config) {
                var triggerUpdate = ArrayHelpers.sync(self.services, data.items);
                if (triggerUpdate) {
                    Service.log.debug("Services updated: ", self.services);
                    Core.$apply($rootScope);
                }
                next();
            },
            onFailedPoll: function (next, data, status, headers, config) {
                Service.log.debug("Failed poll, data: ", data, " status: ", status);
                next();
            }
        };
        return self;
    }]);
    Service._module.run(['ServiceRegistry', '$timeout', 'jolokia', function (ServiceRegistry, $timeout, jolokia) {
        ServiceRegistry.go = PollHelpers.setupPolling(ServiceRegistry, function (next) {
            ServiceRegistry.fetch(next);
        }, 2000, $timeout, jolokia);
        ServiceRegistry.go();
        Service.log.debug("Loaded");
    }]);
    hawtioPluginLoader.addModule(Service.pluginName);
})(Service || (Service = {}));

angular.module("hawtio-kubernetes-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/example/html/page1.html","<div class=\"row\">\n  <div class=\"col-md-12\" ng-controller=\"Example.Page1Controller\">\n    <h1>Page 1</h1>\n    <p>Hello {{target}}</p>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/apps.html","<style type=\"text/css\">\n  .filter-header {\n    padding-bottom: 10px;\n  }\n\n  .app-name {\n    padding-left: 10px;\n  }\n\n  .profile-selector-name .app-name {\n    padding-left: 4px;\n  }\n\n  .ngCellText .icon-replication-controller {\n    vertical-align: middle;\n  }\n\n  img.icon-small-app {\n    width: 24px;\n    height: 24px;\n    vertical-align: text-bottom;\n  }\n\n  .profile-selector-name {\n    line-height: 24px;\n  }\n\n  img.icon-selected-app {\n    width: 64px;\n    height: 64px;\n    vertical-align: middle;\n  }\n\n  .selected-app-name {\n    line-height: 36px;\n    padding-left: 5px;\n  }\n\n  .service-view-rectangle {\n    position: relative;\n    margin-left: 0;\n    margin-right: 0px;\n    margin-bottom: 15px;\n    margin-top: 0;\n    background-color: #fafafa;\n\n    border-width:  1px;\n    border-style: solid;\n    border-color: #eeeeee;\n  }\n\n  .service-view-header {\n    padding-left: 20px;\n    padding-right: 20px;\n    padding-top: 8px;\n    padding-bottom: 5px;\n  }\n\n  .service-view-icon img {\n    width: 24px;\n    height: 24px;\n    padding-right: 6px;\n  }\n\n  .service-view-name {\n    font-size: larger;\n    font-weight: bold;\n  }\n\n  .service-view-address {\n    padding-left: 30px;\n  }\n\n  .service-view-detail-header {\n    padding-left: 0px;\n    padding-right: 0px;\n    padding-top: 5px;\n    padding-bottom: 0px;\n    height: 20px;\n    min-height: 20px;\n    max-height: 20px;\n  }\n\n  .service-view-detail-header .span4,\n  .service-view-detail-header .value {\n    height: 20px;\n    min-height: 20px;\n    max-height: 20px;\n  }\n\n  .service-view-detail-header a {\n    color: black;\n  }\n\n  .service-view-detail-rectangle {\n    background-color: #eeeeee;\n\n    padding-left: 20px;\n    padding-right: 20px;\n  }\n\n  .service-view-detail-rectangle .value {\n    font-weight: 600;\n  }\n\n  .service-view-detail-pod-box {\n    background-color: #eeeeee;\n    display: inline-block;\n    font-size: smaller;\n  }\n\n  .service-view-detail-pod-summary,\n  .service-view-detail-pod-summary-expand {\n    display: inline-block;\n\n    padding-top: 2px;\n    padding-bottom: 2px;\n    padding-left: 20px;\n    padding-right: 20px;\n\n    margin-right: 8px;\n    margin-bottom: 8px;\n\n    background-color: #ffffff;\n  }\n\n  .service-view-detail-pod-template {\n  }\n\n  .service-view-detail-pod-counts {\n  }\n\n  .service-view-detail-pod-status {\n    line-height: 36px;\n    padding-right: 20px;\n  }\n\n  .service-view-detail-pod-status i {\n    font-size: 36px;\n    display: inline-block;\n    vertical-align: middle;\n  }\n\n  .service-view-detail-pod-expand {\n    color: #a0a0a0;\n    font-size: 18px;\n    padding-right: 0px;\n  }\n\n  .service-view-detail-pod-id {\n  }\n\n</style>\n<div ng-controller=\"Kubernetes.Apps\">\n  <script type=\"text/ng-template\" id=\"appIconTemplate.html\">\n    <div class=\"ngCellText\" title=\"{{row.entity.$info.description}}\">\n      <a ng-href=\"row.entity.$appUrl\">\n        <img ng-show=\"row.entity.$iconUrl\" class=\"icon-replication-controller\" ng-src=\"{{row.entity.$iconUrl}}\">\n      </a>\n      <span class=\"app-name\">\n        <a ng-click=\"row.entity.$select()\">\n          {{row.entity.$info.name}}\n        </a>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"appServicesTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"service in row.entity.services\">\n        <a href=\"#/kubernetes/services?_id={{service.id}}\">\n          <span>{{service.name || service.id}}</span>\n        </a>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"appDeployedTemplate.html\">\n    <div class=\"ngCellText\" title=\"deployed at: {{row.entity.$creationDate | date:\'yyyy-MMM-dd HH:mm:ss Z\'}}\">\n      {{row.entity.$creationDate.relative()}}\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"appReplicationControllerTemplate.html\">\n    <div class=\"ngCellText\">\n      <span ng-repeat=\"controller in row.entity.replicationControllers\">\n        <a href=\"#/kubernetes/replicationControllers?_id={{controller.id}}\">\n          <span>{{controller.id}}</span>\n        </a>\n        &nbsp;\n        <span class=\"btn btn-small\" ng-click=\"row.entity.$openResizeControllerDialog(controller)\" title=\"Edit the number of replicas of this controller\">{{controller.replicas}}</span>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"appPodCountsAndLinkTemplate.html\">\n    <div class=\"ngCellText\" title=\"Number of running pods for this controller\">\n      <div ng-repeat=\"podCounters in row.entity.$podCounters track by $index\">\n        <a ng-show=\"podCounters.podsLink\" href=\"{{podCounters.podsLink}}\" title=\"{{podCounters.labelText}}\">\n          <span ng-show=\"podCounters.valid\" class=\"badge badge-success\">{{podCounters.valid}}</span>\n          <span ng-show=\"podCounters.waiting\" class=\"badge\">{{podCounters.waiting}}</span>\n          <span ng-show=\"podCounters.error\" class=\"badge badge-warning\">{{podCounters.error}}</span>\n        </a>\n      </div>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"appDetailTemplate.html\">\n    <div class=\"service-view-rectangle\" ng-repeat=\"view in item.$serviceViews\">\n      <div class=\"service-view-header\">\n        <span class=\"service-view-icon\">\n          <img ng-show=\"item.$iconUrl\" ng-src=\"{{item.$iconUrl}}\">\n        </span>\n        <span class=\"service-view-name\" title=\"{{view.name}}\">{{view.appName}}</span>\n        <span class=\"service-view-address\">{{view.address}}</span>\n      </div>\n\n      <div class=\"service-view-detail-rectangle\">\n        <div class=\"service-view-detail-header\">\n          <div class=\"span4\">\n            <div class=\"service-view-detail-deployed\" ng-show=\"view.createdDate\"\n                 title=\"deployed at: {{view.createdDate | date:\'yyyy-MMM-dd HH:mm:ss Z\'}}\">\n              deployed:\n              <span class=\"value\">{{view.createdDate.relative()}}</span>\n            </div>\n          </div>\n          <div class=\"span4\">\n            <div class=\"service-view-detail-pod-template\" ng-show=\"view.controllerId\">\n              pod template:\n              <span class=\"value\">{{view.controllerId}}</span>\n            </div>\n          </div>\n          <div class=\"span4 service-view-detail-pod-counts\">\n            <a ng-show=\"view.replicationController\" class=\"value pull-right\"\n               ng-click=\"item.$openResizeControllerDialog(view.replicationController)\"\n               title=\"Edit the number of pods\">\n              {{view.podCountText}}\n            </a>\n            <span ng-hide=\"view.replicationController\" class=\"value pull-right\">\n              {{view.podCountText}}\n            </span>\n          </div>\n        </div>\n\n        <div class=\"service-view-detail-pod-box\" ng-repeat=\"pod in item.pods\">\n          <div ng-show=\"podExpanded(pod)\" class=\"service-view-detail-pod-summary-expand\">\n            <table>\n              <tr>\n                <td class=\"service-view-detail-pod-status\">\n                  <i ng-class=\"pod.statusClass\"></i>\n                </td>\n                <td>\n                  <div class=\"service-view-detail-pod-id\" title=\"{{pod.id}}\">\n                    <span class=\"value\">Pod {{pod.idAbbrev}}</span>\n                  </div>\n                  <div class=\"service-view-detail-pod-ip\">\n                    IP:\n                    <span class=\"value\">{{pod.podIP}}</span>\n                  </div>\n                </td>\n                <td>\n                  <div class=\"service-view-detail-pod-ports\">\n                    ports: <span class=\"value\">{{pod.containerPorts.join(\", \")}}</span>\n                  </div>\n                  <div class=\"service-view-detail-pod-minion\">\n                    minion:\n                    <span class=\"value\">{{pod.host}}</span>\n                  </div>\n                </td>\n                <td class=\"service-view-detail-pod-expand\" ng-click=\"collapsePod(pod)\">\n                  <i class=\"icon-chevron-left\"></i>\n                </td>\n              </tr>\n            </table>\n            <!--\n                                      <div class=\"service-view-detail-pod-status\">\n                                        status:\n                                        <span class=\"value\">{{pod.status}}</span>\n                                      </div>\n            -->\n          </div>\n\n          <div ng-hide=\"podExpanded(pod)\" class=\"service-view-detail-pod-summary\">\n            <table>\n              <tr>\n                <td class=\"service-view-detail-pod-status\">\n                  <i ng-class=\"pod.statusClass\"></i>\n                </td>\n                <td>\n                  <div class=\"service-view-detail-pod-id\" title=\"{{pod.id}}\">\n                    <span class=\"value\">Pod {{pod.idAbbrev}}</span>\n                  </div>\n                  <div class=\"service-view-detail-pod-ip\">\n                    IP:\n                    <span class=\"value\">{{pod.podIP}}</span>\n                  </div>\n                </td>\n                <td class=\"service-view-detail-pod-expand\" ng-click=\"expandPod(pod)\">\n                  <i class=\"icon-chevron-right\"></i>\n                </td>\n              </tr>\n            </table>\n          </div>\n        </div>\n      </div>\n    </div>\n  </script>\n\n\n  <div ng-hide=\"appSelectorShow\">\n    <div class=\"row-fluid filter-header\">\n      <div class=\"span12\">\n        <span ng-show=\"apps.length && !id\">\n          <hawtio-filter ng-model=\"tableConfig.filterOptions.filterText\"\n                         css-class=\"input-xxlarge\"\n                         placeholder=\"Filter apps...\"></hawtio-filter>\n        </span>\n        <button ng-show=\"apps.length\"\n                class=\"btn btn-danger pull-right\"\n                ng-disabled=\"!id && tableConfig.selectedItems.length == 0\"\n                ng-click=\"deletePrompt(id || tableConfig.selectedItems)\">\n          <i class=\"icon-remove\"></i> Delete\n        </button>\n        <span class=\"pull-right\">&nbsp;</span>\n        <button ng-show=\"appSelector.folders.length\"\n                class=\"btn btn-success pull-right\"\n                ng-click=\"appSelectorShow = true\"\n                title=\"Run an application\">\n          <i class=\"icon-play-circle\"></i> Run ...\n        </button>\n        <span class=\"pull-right\">&nbsp;</span>\n        <button ng-show=\"id\"\n                class=\"btn btn-primary pull-right\"\n                ng-click=\"id = undefined\"><i class=\"icon-list\"></i></button>\n\n        <span class=\"pull-right\">&nbsp;</span>\n        <span ng-hide=\"id\" class=\"pull-right\">\n          <div class=\"btn-group\">\n            <a class=\"btn btn-small\" ng-disabled=\"mode == \'list\'\" href=\"\" ng-click=\"mode = \'list\'\">\n              <i class=\"icon-list\"></i></a>\n            <a class=\"btn btn-small\" ng-disabled=\"mode == \'detail\'\" href=\"\" ng-click=\"mode = \'detail\'\">\n              <i class=\"icon-table\"></i></a>\n          </div>\n        </span>\n      </div>\n    </div>\n    <div class=\"row-fluid\">\n      <div class=\"span12\">\n        <div ng-hide=\"fetched\">\n          <div class=\"align-center\">\n            <i class=\"icon-spinner icon-spin\"></i>\n          </div>\n        </div>\n        <div ng-show=\"fetched && !id\">\n          <div ng-hide=\"apps.length\" class=\"align-center\">\n            <p class=\"alert alert-info\">There are no apps currently available.</p>\n          </div>\n          <div ng-show=\"apps.length\">\n            <div ng-show=\"mode == \'list\'\">\n              <table class=\"table table-condensed table-striped\" hawtio-simple-table=\"tableConfig\"></table>\n            </div>\n            <div ng-show=\"mode == \'detail\'\">\n              <div class=\"app-detail\" ng-repeat=\"item in apps | filter:tableConfig.filterOptions.filterText\">\n                <ng-include src=\"\'appDetailTemplate.html\'\"/>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div ng-show=\"fetched && id\">\n          <div class=\"app-detail\">\n            <ng-include src=\"\'appDetailTemplate.html\'\"/>\n          </div>\n        </div>\n      </div>\n    </div>\n\n  </div>\n  <div ng-show=\"appSelectorShow\">\n    <div class=\"span7\">\n      <div class=\"row-fluid\">\n        <hawtio-filter ng-model=\"appSelector.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter apps...\"></hawtio-filter>\n      </div>\n      <div class=\"row-fluid\">\n        <ul>\n          <li class=\"no-list profile-selector-folder\" ng-repeat=\"folder in appSelector.folders\"\n              ng-show=\"appSelector.showFolder(folder)\">\n            <div class=\"expandable\" ng-class=\"appSelector.isOpen(folder)\">\n              <div title=\"{{folder.path}}\" class=\"title\">\n                <i class=\"expandable-indicator folder\"></i> <span class=\"folder-title\" ng-show=\"folder.path\">{{folder.path.capitalize(true)}}</span><span\n                      class=\"folder-title\" ng-hide=\"folder.path\">Uncategorized</span>\n              </div>\n              <div class=\"expandable-body\">\n                <ul>\n                  <li class=\"no-list profile\" ng-repeat=\"profile in folder.apps\" ng-show=\"appSelector.showApp(profile)\">\n                    <div class=\"profile-selector-item\">\n                      <div class=\"inline-block profile-selector-checkbox\">\n                        <input type=\"checkbox\" ng-model=\"profile.selected\"\n                               ng-change=\"appSelector.updateSelected()\">\n                      </div>\n                      <div class=\"inline-block profile-selector-name\" ng-class=\"appSelector.getSelectedClass(profile)\">\n                        <span class=\"contained c-max\">\n                          <a href=\"\" ng-click=\"appSelector.select(profile, !profile.selected)\"\n                             title=\"Details for {{profile.id}}\">\n                              <img ng-show=\"profile.$iconUrl\" class=\"icon-small-app\" ng-src=\"{{profile.$iconUrl}}\">\n                              <span class=\"app-name\">{{profile.name}}</span>\n                          </a>\n                        </span>\n                      </div>\n                    </div>\n\n                  </li>\n                </ul>\n              </div>\n            </div>\n          </li>\n        </ul>\n      </div>\n    </div>\n    <div class=\"span5\">\n      <div class=\"row-fluid\">\n        <button class=\"btn btn-primary pull-right\"\n                ng-click=\"appSelectorShow = undefined\"><i class=\"icon-circle-arrow-left\"></i> Back\n        </button>\n        <span class=\"pull-right\">&nbsp;</span>\n        <button class=\"btn pull-right\"\n                ng-disabled=\"!appSelector.selectedApps.length\"\n                title=\"Clears the selected Apps\"\n                ng-click=\"appSelector.clearSelected()\"><i class=\"icon-check-empty\"></i> Clear\n        </button>\n        <span class=\"pull-right\">&nbsp;</span>\n        <button class=\"btn btn-success pull-right\"\n                ng-disabled=\"!appSelector.selectedApps.length\"\n                ng-click=\"appSelector.runSelectedApps()\"\n                title=\"Run the selected apps\">\n          <i class=\"icon-play-circle\"></i>\n          <ng-pluralize count=\"appSelector.selectedApps.length\"\n                        when=\"{\'0\': \'No App Selected\',\n                                       \'1\': \'Run App\',\n                                       \'other\': \'Run {} Apps\'}\"></ng-pluralize>\n\n        </button>\n      </div>\n      <div class=\"row-fluid\">\n<!--\n        <div ng-hide=\"appSelector.selectedApps.length\">\n          <p class=\"alert pull-right\">\n            Please select an App\n          </p>\n        </div>\n-->\n\n        <div ng-show=\"appSelector.selectedApps.length\">\n\n          <ul class=\"zebra-list pull-right\">\n            <li ng-repeat=\"app in appSelector.selectedApps\">\n              <img ng-show=\"app.$iconUrl\" class=\"icon-selected-app\" ng-src=\"{{app.$iconUrl}}\">\n              <strong class=\"green selected-app-name\">{{app.name}}</strong>\n              &nbsp;\n              <i class=\"red clickable icon-remove\"\n                 title=\"Remove appp\"\n                 ng-click=\"appSelector.select(app, false)\"></i>\n            </li>\n          </ul>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div modal=\"resizeDialog.dialog.show\">\n    <form class=\"form-horizontal\" ng-submit=\"resizeDialog.onOk()\">\n        <div class=\"modal-header\"><h4>Resize {{resize.controller.id}}</h4></div>\n        <div class=\"modal-body\">\n          <div class=\"control-group\">\n            <label class=\"control-label\" for=\"replicas\">Replica count</label>\n\n            <div class=\"controls\">\n              <input type=\"number\" min=\"0\" id=\"replicas\" ng-model=\"resize.newReplicas\">\n            </div>\n          </div>\n\n        </div>\n        <div class=\"modal-footer\">\n          <input class=\"btn btn-primary\" type=\"submit\"\n                 ng-disabled=\"resize.newReplicas === resize.controller.replicas\"\n                 value=\"Resize\">\n          <button class=\"btn btn-warning cancel\" type=\"button\" ng-click=\"resizeDialog.close()\">Cancel</button>\n        </div>\n      </form>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/kubernetesJsonDirective.html","<div>\n  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <div class=\"fabric-page-header row-fluid\">\n\n        <div class=\"pull-left\" ng-show=\"iconURL\">\n          <div class=\"app-logo\">\n            <img ng-src=\"{{iconURL}}\">&nbsp;\n          </div>\n        </div>\n        <div class=\"pull-left\">\n            <h2 class=\"inline\"><span class=\"contained c-wide3\">&nbsp;{{displayName || appTitle}}</span></h2>\n        </div>\n        <div class=\"pull-right\">\n          <button class=\"btn btn-success pull-right\"\n                  title=\"Run this application\"\n                  ng-disabled=\"!config || config.error\"\n                  ng-click=\"apply()\">\n            <i class=\"icon-play-circle\"></i> Run\n          </button>\n        </div>\n        <div class=\"pull-left span10 profile-summary-wide\">\n          <div\n               ng-show=\"summaryHtml\"\n               ng-bind-html-unsafe=\"summaryHtml\"></div>\n        </div>\n      </div>\n\n    </div>\n  </div>\n\n</div>\n");
$templateCache.put("plugins/kubernetes/html/layoutKubernetes.html","<script type=\"text/ng-template\" id=\"idTemplate.html\">\n  <div class=\"ngCellText\" ng-controller=\"Kubernetes.IDSelector\">\n    <a href=\"\" \n       title=\"View details for {{row.entity.id}}\"\n       ng-click=\"select(row.entity.id)\">{{row.entity.id}}</a>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"selectorTemplate.html\">\n  <div class=\"ngCellText\">\n    <span ng-repeat=\"(name, value) in row.entity.selector track by $index\">\n      <strong>{{name}}</strong>: {{value}}\n    </span>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"podCountsAndLinkTemplate.html\">\n  <div class=\"ngCellText\" title=\"Number of running pods for this controller\">\n    <a ng-show=\"row.entity.$podCounters.podsLink\" href=\"{{row.entity.$podCounters.podsLink}}\" title=\"View pods\">\n      <span ng-show=\"row.entity.$podCounters.valid\" class=\"badge badge-success\">{{row.entity.$podCounters.valid}}</span>\n      <span ng-show=\"row.entity.$podCounters.waiting\" class=\"badge\">{{row.entity.$podCounters.waiting}}</span>\n      <span ng-show=\"row.entity.$podCounters.error\" class=\"badge badge-warning\">{{row.entity.$podCounters.error}}</span>\n    </a>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"labelTemplate.html\">\n  <div class=\"ngCellText\" ng-init=\"entity=row.entity\" ng-controller=\"Kubernetes.Labels\">\n    <p ng-show=\"data\"><strong>Labels</strong></p>\n    <span ng-repeat=\"label in labels track by $index\"\n          class=\"pod-label badge\"\n          ng-class=\"labelClass(label.key)\"\n          ng-click=\"handleClick(entity, label.key, label)\"\n          title=\"{{label.key}}\">{{label.title}}</span>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"portalAddress.html\">\n  <div class=\"ngCellText\">\n    <a target=\"openService\" href=\"http://{{row.entity.portalIP}}:{{row.entity.port}}/\"\n       ng-show=\"row.entity.portalIP && row.entity.$podCounters.valid\" title=\"Protocol {{row.entity.protocol}}\">\n      {{row.entity.portalIP}}:{{row.entity.port}}\n    </a>\n    <span ng-hide=\"row.entity.portalIP && row.entity.$podCounters.valid\">{{row.entity.portalIP}}:{{row.entity.port}}</span>\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"iconCellTemplate.html\">\n  <div class=\"ngCellText\" ng-init=\"entity=row.entity\" ng-include=\"\'replicationControllerIconTemplate.html\'\">unknown</div>\n</script>\n<script type=\"text/ng-template\" id=\"replicationControllerIconTemplate.html\">\n  <div ng-init=\"entity = entity\" ng-controller=\"Kubernetes.ReplicationControllerIcon\">\n    <img class=\"icon-replication-controller\" ng-src=\"{{iconUrl}}\">\n  </div>\n</script>\n<script type=\"text/ng-template\" id=\"statusTemplate.html\">\n  <div class=\"ngCellText\" ng-init=\"entity=row.entity\" ng-controller=\"Kubernetes.PodStatus\" title=\"Pod {{entity.id}} is {{entity.currentState.status}}\">\n    <!-- in detail view -->\n    <p ng-show=\"data\"><strong>Status: </strong></p>\n    <i ng-class=\"statusMapping(entity.currentState.status)\"></i>\n    <span ng-show=\"data\">{{data}}</span>\n    <!-- in table -->\n    <span ng-show=\"entity.$jolokiaUrl\">\n      <a class=\"clickable\"\n         href=\"\"\n         ng-click=\"entity.$connect.doConnect(row.entity)\"\n         title=\"Open a new window and connect to this container\">\n        <i class=\"icon-signin\"></i>\n      </a>\n    </span>\n  </div>\n</script>\n<div class=\"row-fluid\" ng-controller=\"Kubernetes.TopLevel\">\n  <div class=\"span12\">\n    <ul class=\"nav nav-tabs connected\">\n      <li ng-class=\'{active : isActive(\"#/kubernetes/apps\")}\' ng-show=\"showAppView\"\n          title=\"View all of the Apps running right now\">\n        <a ng-href=\"#/kubernetes/apps\">Apps</a>\n      </li>\n      <li ng-class=\'{active : isActive(\"#/kubernetes/services\")}\'\n          title=\"View kubernetes services and their status\">\n        <a ng-href=\"#/kubernetes/services\">Services</a>\n      </li>\n      <li ng-class=\'{active : isActive(\"#/kubernetes/replicationControllers\")}\'\n          title=\"View kubernetes replication controllers and their status\">\n        <a ng-href=\"#/kubernetes/replicationControllers\">Controllers</a>\n      </li>\n      <li ng-class=\'{active : isActive(\"#/kubernetes/pods\")}\'\n          title=\"View kubernetes pods and their status\">\n        <a ng-href=\"#/kubernetes/pods\">Pods</a>\n      </li>\n      <li ng-class=\'{active : isActive(\"#/kubernetes/overview\")}\'\n          title=\"View an overview diagram of the system. Version: {{version.major}}.{{version.minor}}\">\n        <a ng-href=\"#/kubernetes/overview\">Diagram</a>\n      </li>\n      <li class=pull-right>\n        namespace: <select ng-model=\"kubernetes.selectedNamespace\" ng-options=\"namespace for namespace in kubernetes.namespaces\" title=\"choose the namespace - which is a selection of resources in kubernetes\">\n            <!--option ng-repeat=\"namespace in namespaces\" value=\"{{namespace}}\">{{namespace}}</option-->\n        </select>\n      <li>\n    </ul>\n    <div class=\"wiki-icon-view\" ng-controller=\"Kubernetes.FileDropController\" nv-file-drop nv-file-over uploader=\"uploader\" over-class=\"ready-drop\">\n      <div class=\"row-fluid\" ng-view>\n      </div>\n    </div>\n  </div>\n</div>\n\n");
$templateCache.put("plugins/kubernetes/html/overview.html","<div ng-controller=\"Kubernetes.OverviewController\">\n  <link rel=\"stylesheet\" href=\"app/kubernetes/html/overview.css\">\n  <script type=\"text/ng-template\" id=\"serviceBoxTemplate.html\">\n    <div class=\"row-fluid\">\n      <div class=\"span3 align-left node-body\">{{entity.port}}</div>\n      <div class=\"span9 align-right node-header\" title=\"{{entity.id}}\">{{entity.id}}</div>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"serviceTemplate.html\">\n    <div class=\"kubernetes-overview-row\">\n      <div class=\"kubernetes-overview-cell\">\n        <div id=\"{{service._key}}\"\n             namespace=\"{{service.namespace}}\"\n             connect-to=\"{{service.connectTo}}\"\n             data-type=\"service\"\n             class=\"jsplumb-node kubernetes-node kubernetes-service-node\"\n             ng-controller=\"Kubernetes.OverviewBoxController\"\n             ng-init=\"entity=getEntity(\'service\', \'{{service._key}}\')\"\n             ng-mouseenter=\"mouseEnter($event)\"\n             ng-mouseleave=\"mouseLeave($event)\"\n             ng-click=\"viewDetails(\'services\')\">\n          <div ng-init=\"entity=entity\" ng-include=\"\'serviceBoxTemplate.html\'\"></div>\n        </div>\n      </div>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"hostTemplate.html\">\n    <div class=\"kubernetes-overview-row\">\n      <div class=\"kubernetes-overview-cell\">\n        <div id=\"{{host.id}}\"\n             data-type=\"host\"\n             class=\"kubernetes-host-container\">\n          <h5>{{host.id}}</h5>\n          <div class=\"pod-container\"></div>\n        </div>\n      </div>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"podTemplate.html\">\n    <div id=\"{{pod._key}}\"\n         data-type=\"pod\"\n         title=\"Pod ID: {{pod.id}}\"\n         class=\"jsplumb-node kubernetes-node kubernetes-pod-node\" \n         ng-mouseenter=\"mouseEnter($event)\"\n         ng-mouseleave=\"mouseLeave($event)\"\n         ng-controller=\"Kubernetes.OverviewBoxController\"\n         ng-init=\"entity=getEntity(\'pod\', \'{{pod._key}}\')\"\n         ng-click=\"viewDetails(\'pods\')\">\n    <div class=\"css-table\">\n      <div class=\"css-table-row\">\n        <div class=\"pod-status-cell css-table-cell\">\n          <span ng-init=\"row={ entity: entity }\" ng-include=\"\'statusTemplate.html\'\"></span>\n        </div>\n        <div class=\"pod-label-cell css-table-cell\">\n          <span ng-init=\"row={ entity: entity }\" ng-include=\"\'labelTemplate.html\'\"></span>\n        </div>\n    </div>\n  </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"replicationControllerTemplate.html\">\n    <div class=\"kubernetes-overview-row\">\n      <div class=\"kubernetes-overview-cell\">\n        <div\n            id=\"{{replicationController._key}}\"\n            title=\"{{replicationController.id}}\"\n            data-type=\"replicationController\"\n            data-placement=\"top\"\n            connect-to=\"{{replicationController.connectTo}}\"\n            ng-mouseenter=\"mouseEnter($event)\"\n            ng-mouseleave=\"mouseLeave($event)\"\n            class=\"jsplumb-node kubernetes-replicationController-node kubernetes-node\"\n            ng-controller=\"Kubernetes.OverviewBoxController\"\n            ng-init=\"entity=getEntity(\'replicationController\', \'{{replicationController._key}}\')\"\n            ng-click=\"viewDetails(\'replicationControllers\')\">\n          <div ng-init=\"entity = entity\" ng-include=\"\'replicationControllerIconTemplate.html\'\">\n          </div>\n        </div>\n      </div>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"overviewTemplate.html\">\n    <div class=\"kubernetes-overview\"\n         hawtio-jsplumb\n         draggable=\"false\"\n         layout=\"false\"\n         node-sep=\"50\"\n         rank-sep=\"300\">\n      <div class=\"kubernetes-overview-row\">\n        <div class=\"kubernetes-overview-cell\">\n          <div class=\"kubernetes-overview services\">\n            <h6>Services</h6>\n          </div>\n        </div>\n        <div class=\"kubernetes-overview-cell\">\n          <div class=\"kubernetes-overview hosts\">\n            <h6>Hosts and Pods</h6>\n          </div>\n        </div>\n        <div class=\"kubernetes-overview-cell\">\n          <div class=\"kubernetes-overview replicationControllers\">\n            <h6>Replication controllers</h6>\n          </div>\n        </div>\n      </div>\n   </div>\n  </script>\n  <kubernetes-overview ui-if=\"kubernetes.selectedNamespace\"></kubernetes-overview>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/pods.html","<div class=\"row-fluid\" ng-controller=\"Kubernetes.Pods\">\n  <div hawtio-confirm-dialog=\"connect.dialog.show\" title=\"Connect to {{connect.containerName}}?\" ok-button-text=\"Connect\" on-ok=\"connect.onOK()\">\n    <div class=\"dialog-body\">\n      <p>Please enter the user name and password for {{connect.containerName}}:</p>\n      <div class=\"control-group\">\n        <label class=\"control-label\">User name: </label>\n        <div class=\"controls\">\n          <input name=\"userName\" ng-model=\"connect.userName\" type=\"text\" autofill>\n        </div>\n      </div>\n      <div class=\"control-group\">\n        <label class=\"control-label\">Password: </label>\n        <div class=\"controls\">\n          <input name=\"password\" ng-model=\"connect.password\" type=\"password\" autofill>\n        </div>\n      </div>\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <label class=\"checkbox\">\n            <input type=\"checkbox\" ng-model=\"connect.saveCredentials\"> Save these credentials as the default\n          </label>\n        </div>\n      </div>\n      <div>\n      </div>\n    </div>\n  </div>\n  <script type=\"text/ng-template\" id=\"imageTemplate.html\">\n    <div class=\"ngCellText\">\n      <!-- in table -->\n      <span ng-hide=\"data\">\n        <span ng-repeat=\"container in row.entity.desiredState.manifest.containers\">\n          <a target=\"dockerRegistry\" href=\"https://registry.hub.docker.com/u/{{container.image}}\" title=\"{{container.name}}\">{{container.image}}</a>\n        </span>\n      </span>\n      <!-- in detail view -->\n      <span ng-show=\"data\">\n        <a target=\"dockerRegistry\" ng-href=\"https://registry.hub.docker.com/u/{{data}}\" title=\"{{data}}\">{{data}}</a>\n      </span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"configDetail.html\">\n    <pre>{{data}}</pre>\n  </script>\n  <script type=\"text/ng-template\" id=\"envItemTemplate.html\">\n    <span ng-controller=\"Kubernetes.EnvItem\">\n      <span class=\"blue\">{{key}}</span>=<span class=\"green\">{{value}}</span>\n    </span>\n  </script>\n  <div class=\"row-fluid\">\n    <div class=\"span12\" ng-show=\"pods.length\">\n      <span ng-show=\"!id\">\n        <hawtio-filter ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter pods...\"></hawtio-filter>\n      </span>\n      <button ng-show=\"fetched\"\n              class=\"btn btn-danger pull-right\"\n              ng-disabled=\"!id && tableConfig.selectedItems.length == 0\"\n              ng-click=\"deletePrompt(id || tableConfig.selectedItems)\">\n        <i class=\"icon-remove\"></i> Delete\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"id\"\n              class=\"btn btn-primary pull-right\"\n              ng-click=\"id = undefined\"><i class=\"icon-list\"></i></button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"hasService(\'kibana-service\')\"\n              class=\"btn pull-right\"\n              title=\"View the logs for the selected pods\"\n              ng-disabled=\"!id && tableConfig.selectedItems.length == 0\"\n              ng-click=\"openLogs()\">Logs</button>\n    </div>\n  </div>\n  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align\">\n          <i class=\"icon-spinner icon-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched && !id\">\n        <div ng-hide=\"pods.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no pods currently running.</p>\n        </div>\n        <div ng-show=\"pods.length\">\n          <table class=\"table table-condensed table-striped\" ui-if=\"kubernetes.selectedNamespace\"\n                 hawtio-simple-table=\"tableConfig\"></table>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"row-fluid\" ng-show=\"fetched && id\">\n    <div class=\"span12\">\n      <div hawtio-object=\"item\" config=\"podDetail\"></div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/replicationControllers.html","<div ng-controller=\"Kubernetes.ReplicationControllers\">\n  <script type=\"text/ng-template\" id=\"currentReplicasTemplate.html\">\n    <div class=\"ngCellText\" title=\"Number of running pods for this controller\">\n      <a ng-show=\"row.entity.podsLink\" href=\"{{row.entity.podsLink}}\">\n        <span class=\"badge {{row.entity.currentState.replicas > 0 ? \'badge-success\' : \'badge-warning\'}}\">{{row.entity.currentState.replicas}}</span>\n      </a>\n      <span ng-hide=\"row.entity.podsLink\" class=\"badge\">{{row.entity.currentState.replicas}}</span>\n    </div>\n  </script>\n  <script type=\"text/ng-template\" id=\"desiredReplicas.html\">\n    <div class=\"ngCellText\"\n         ng-controller=\"Kubernetes.DesiredReplicas\">\n      <input type=\"number\"\n             class=\"no-bottom-margin\"\n             min=\"0\"\n             ng-model=\"row.entity.desiredState.replicas\">\n    </div>\n  </script>\n  <div class=\"row-fluid\">\n    <div class=\"span12\" ng-show=\"replicationControllers.length\">\n      <span ng-show=\"!id\">\n        <hawtio-filter ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter replication controllers...\"\n                       save-as=\"kubernetes-replication-controllers-text-filter\"></hawtio-filter>\n      </span>\n      <button ng-show=\"fetched\"\n              class=\"btn btn-danger pull-right\"\n              ng-disabled=\"!id && tableConfig.selectedItems.length == 0\"\n              ng-click=\"deletePrompt(id || tableConfig.selectedItems)\">\n        <i class=\"icon-remove\"></i> Delete\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"fetched && !id\"\n              class=\"btn pull-right\"\n              ng-disabled=\"!anyDirty()\"\n              ng-click=\"undo()\">\n        <i class=\"icon-undo\"></i> Undo</span>\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"fetched && !id\"\n              class=\"btn btn-primary pull-right\"\n              ng-disabled=\"!anyDirty()\"\n              ng-click=\"save()\">\n        <i class=\"icon-save\"></i> Save</span>\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"id\"\n              class=\"btn btn-primary pull-right\"\n              ng-click=\"id = undefined\"><i class=\"icon-list\"></i></button>\n    </div>\n  </div>\n  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"icon-spinner icon-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched && !id\">\n        <div ng-hide=\"replicationControllers.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no replication controllers currently available.</p>\n        </div>\n        <div ng-show=\"replicationControllers.length\">\n          <table class=\"table table-condensed table-striped\" ui-if=\"kubernetes.selectedNamespace\"\n                 hawtio-simple-table=\"tableConfig\"></table>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"row-fluid\" ng-show=\"fetched && id\">\n    <div class=\"span12\">\n      <div hawtio-object=\"item\" config=\"detailConfig\"></div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("plugins/kubernetes/html/services.html","<div ng-controller=\"Kubernetes.Services\">\n  <div class=\"row-fluid\">\n    <div class=\"span12\" ng-show=\"services.length\">\n      <span ng-show=\"!id\">\n        <hawtio-filter ng-model=\"tableConfig.filterOptions.filterText\"\n                       css-class=\"input-xxlarge\"\n                       placeholder=\"Filter services...\"\n                       save-as=\"kubernetes-services-text-filter\"></hawtio-filter>\n      </span>\n      <button ng-show=\"fetched\"\n              class=\"btn btn-danger pull-right\"\n              ng-disabled=\"!id && tableConfig.selectedItems.length == 0\"\n              ng-click=\"deletePrompt(id || tableConfig.selectedItems)\">\n        <i class=\"icon-remove\"></i> Delete\n      </button>\n      <span class=\"pull-right\">&nbsp;</span>\n      <button ng-show=\"id\"\n              class=\"btn btn-primary pull-right\"\n              ng-click=\"id = undefined\"><i class=\"icon-list\"></i></button>\n    </div>\n  </div>\n  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <div ng-hide=\"fetched\">\n        <div class=\"align-center\">\n          <i class=\"icon-spinner icon-spin\"></i>\n        </div>\n      </div>\n      <div ng-show=\"fetched && !id\">\n        <div ng-hide=\"services.length\" class=\"align-center\">\n          <p class=\"alert alert-info\">There are no services currently available.</p>\n        </div>\n        <div ng-show=\"services.length\">\n          <table class=\"table table-condensed table-striped\" ui-if=\"kubernetes.selectedNamespace\"\n                 hawtio-simple-table=\"tableConfig\"></table>\n        </div>\n      </div>\n      <div ng-show=\"fetched && id\">\n        <p></p>\n        <div hawtio-object=\"item\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");}]); hawtioPluginLoader.addModule("hawtio-kubernetes-templates");