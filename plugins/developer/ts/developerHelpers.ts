/// <reference path="../../includes.ts"/>
module Developer {

  export var context = '/workspaces';
  export var hash = '#' + context;
  export var pluginName = 'Developer';
  export var pluginPath = 'plugins/developer/';
  export var templatePath = pluginPath + 'html/';
  export var log:Logging.Logger = Logger.get(pluginName);

  export var jenkinsServiceName = "jenkins";
  export var jenkinsServiceNameAndPort = jenkinsServiceName + ":http";

  export var jenkinsHttpConfig = {
    headers: {
      Accept: "application/json, text/x-json, text/plain"
    }
  };

  /**
   * Returns true if the value hasn't changed from the last cached JSON version of this object
   */
  export function hasObjectChanged(value, state) {
    var json = angular.toJson(value || "");
    var oldJson = state.json;
    state.json = json;
    return !oldJson || json !== oldJson;
  }

  export function projectForScope($scope) {
    if ($scope) {
      return $scope.buildConfig || $scope.entity || ($scope.model || {}).project;
    }
    return null;
  }
  /**
   * Lets load the project versions for the given namespace
   */
  export function loadProjectVersions($scope, $element, project, env, ns, answer, caches) {
    var projectAnnotation = "project";
    var versionAnnotation = "version";

    var projectNamespace = project.$namespace;
    var projectName = project.$name;

    var cache = caches[ns];
    if (!cache) {
      cache = {};
      caches[ns] = cache;
    }

    var status = {
      rcs: [],
      pods: [],
      routes: [],
      services: []
    };

    var imageStreamTags = [];

    function updateModel() {
      var projectInfos = {};
      var model = $scope.model || {};

      angular.forEach(status.rcs, (item) => {
        var metadata = item.metadata || {};
        var name = metadata.name;
        var labels = metadata.labels || {};
        var annotations = metadata.annotations || {};
        var spec = item.spec || {};
        var selector = spec.selector;

        var project = labels[projectAnnotation];
        var version = labels[versionAnnotation];

        // lets try the S2I defaults...
        if (!project) {
          project = labels["app"];
        }
        if (!version) {
          version = annotations["openshift.io/deployment-config.latest-version"]
        }
        if (project && version && project === projectName) {
          var projects = projectInfos[project];
          if (!projects) {
            projects = {
              project: project,
              versions: {}
            };
            projectInfos[project] = projects;
          }
          var versionInfo = projects.versions[version];
          if (!versionInfo) {
            versionInfo = {
              replicationControllers: {}
            };
            projects.versions[version] = versionInfo;
          }
          if (name) {
            versionInfo.replicationControllers[name] = item;
            item.$name = name;
            if (projectNamespace && projectName) {
              item.$viewLink = UrlHelpers.join("/workspaces/", projectNamespace, "projects", projectName, "namespace", ns, "replicationControllers", name);
            } else {
              log.warn("Missing project data! " + projectNamespace + " name " + projectName);
            }

            item.$services = [];
            var rcLink = null;
            status.services.forEach((service) => {
              var repSelector = Kubernetes.getSelector(item);
              var serviceSelector = Kubernetes.getSelector(service);
              if (serviceSelector && repSelector &&
                Kubernetes.selectorMatches(serviceSelector, repSelector) &&
                Kubernetes.getNamespace(service) === Kubernetes.getNamespace(item)) {
                status.routes.forEach((route) => {
                  var serviceName = Kubernetes.getName(service);
                  if (serviceName === Kubernetes.getName(route)) {
                    service["$route"] = route;
                    service["$host"] = Core.pathGet(route, ["spec", "host"]);
                    item.$services.push(service);
                    if (!rcLink) {
                      var url = Kubernetes.serviceLinkUrl(service);
                      if (url) {
                        // TODO find icon etc?
                        rcLink = {
                          name: serviceName,
                          href: url
                        };
                      }
                    }
                  }
                });
              }
            });
            item["$serviceLink"] = rcLink;
          }
          item.$buildId = annotations["fabric8.io/build-id"] || item.$buildId;
          item.$buildUrl = annotations["fabric8.io/build-url"] || item.$buildUrl;
          item.$gitCommit = annotations["fabric8.io/git-commit"] || item.$gitCommit;
          item.$gitUrl = annotations["fabric8.io/git-url"] || item.$gitUrl;
          item.$gitBranch = annotations["fabric8.io/git-branch"] || item.$gitBranch;
          if (!item.$gitCommit) {
            var image = getImage(item);
            if (image) {
              if (!$scope.$isWatchImages) {
                $scope.$isWatchImages = true;
                Kubernetes.watch($scope, $element, "images", null, (data) => {
                  imageStreamTags = data;
                  checkForMissingMetadata();
                });
              } else {
                checkForMissingMetadata();
              }
            }

            function getImage(item) {
              var image = "";
              // lets see if we can find the commit id from a S2I image name
              // TODO needs this issue fixed to find it via an OpenShift annotation:
              // https://github.com/openshift/origin/issues/6241
              var containers = Core.pathGet(item, ["spec", "template", "spec", "containers"]);
              if (containers && containers.length) {
                var container = containers[0];
                if (container) {
                  image = container.image;
                }
              }
              return image;
            }

            function checkForMissingMetadata() {
              angular.forEach(projects.versions, (vi) => {
                angular.forEach(vi.replicationControllers, (item, name) => {
                  if (!item.$gitCommit) {
                    var image = getImage(item);
                    if (image) {
                      angular.forEach(imageStreamTags, (imageStreamTag) => {
                        var imageName = imageStreamTag.dockerImageReference;
                        if (imageName && imageName === image) {
                          var foundISTag = imageStreamTag;
                          var manifestJSON = imageStreamTag.dockerImageManifest;
                          if (manifestJSON) {
                            var manifest = angular.fromJson(manifestJSON) || {};
                            var history = manifest.history;
                            if (history && history.length) {
                              var v1 = history[0].v1Compatibility;
                              if (v1) {
                                var data = angular.fromJson(v1);
                                var env = Core.pathGet(data, ["config", "Env"]);
                                angular.forEach(env, (envExp) => {
                                  if (envExp) {
                                    var values = envExp.split("=");
                                    if (values.length === 2 && values[0] == "OPENSHIFT_BUILD_NAME") {
                                      var buildName = values[1];
                                      if (buildName) {
                                        item.$buildId = buildName;
                                        item.$buildUrl = Developer.projectWorkspaceLink(ns, projectName, "buildLogs/" + buildName);
                                      }
                                    }
                                  }
                                });
                                var labels = Core.pathGet(data, ["config", "Labels"]);
                                if (labels) {
                                  item.$gitCommit = labels["io.openshift.build.commit.id"] || item.$gitCommit;
                                  item.$gitCommitAuthor = labels["io.openshift.build.commit.author"] || item.$gitCommitAuthor;
                                  item.$gitCommitDate = labels["io.openshift.build.commit.date"] || item.$gitCommitDate;
                                  item.$gitCommitMessage = labels["io.openshift.build.commit.message"] || item.$gitCommitMessage;
                                  item.$gitBranch = labels["io.openshift.build.commit.ref"] || item.$gitBranch;

                                  if (!item.$gitUrl && item.$gitCommit) {
                                    item.$gitUrl = Developer.projectWorkspaceLink(ns, projectName, "wiki/commitDetail///" + item.$gitCommit);
                                  }
                                }
                              }
                            }
                          }
                        }
                      });
                    }
                  }
                });
              });
            }
          }

          if (selector) {
            var selectorText = Kubernetes.labelsToString(selector, ",");
            var podLinkUrl = UrlHelpers.join(projectLink(projectName), "namespace", ns, "pods");
            item.pods = [];
            item.$podCounters = Kubernetes.createPodCounters(selector, status.pods, item.pods, selectorText, podLinkUrl);
          }
        }
      });

      // lets check for a project name if we have lots of RCs with no pods, lets remove them!
      angular.forEach(projectInfos, (project, projectName) => {
        var rcsNoPods = [];
        var rcsWithPods = [];
        angular.forEach(project.versions, (versionInfo) => {
          var rcs = versionInfo.replicationControllers;
          angular.forEach(rcs, (item, name) => {
            var count = Kubernetes.podCounterTotal(item.$podCounters);
            if (count) {
              rcsWithPods.push(name);
            } else {
              rcsNoPods.push(() => {
                delete rcs[name];
              });
            }
          });
        });
        if (rcsWithPods.length) {
          // lets remove all the empty RCs
          angular.forEach(rcsNoPods, (fn) => {
            fn();
          });
        }
      });

      if (hasObjectChanged(projectInfos, cache)) {
        log.debug("project versions has changed!");
        answer[ns] = projectInfos;
      }
    }

    Kubernetes.watch($scope, $element, "replicationcontrollers", ns, (data) => {
      if (data) {
        status.rcs = data;
        updateModel();
      }
    });
    Kubernetes.watch($scope, $element, "services", ns, (data) => {
      if (data) {
        status.services = data;
        updateModel();
      }
    });
    Kubernetes.watch($scope, $element, "routes", ns, (data) => {
      if (data) {
        status.routes = data;
        updateModel();
      }
    });
    Kubernetes.watch($scope, $element, "pods", ns, (data) => {
      if (data) {
        status.pods = data;
        updateModel();
      }
    });
  }


}