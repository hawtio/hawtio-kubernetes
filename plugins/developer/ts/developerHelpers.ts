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
      pods: []
    };

    function updateModel() {
      var projectInfos = {};

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
          }
          item.$buildId = annotations["fabric8.io/build-id"];
          item.$buildUrl = annotations["fabric8.io/build-url"];
          item.$gitCommit = annotations["fabric8.io/git-commit"];
          item.$gitUrl = annotations["fabric8.io/git-url"];
          item.$gitBranch = annotations["fabric8.io/git-branch"];
          if (!item.$gitCommit) {
            // lets see if we can find the commit id from a S2I image name
            // TODO needs this issue fixed to find it via an OpenShift annotation:
            // https://github.com/openshift/origin/issues/6241
          }

          if (selector) {
            var selectorText = Kubernetes.labelsToString(selector, ",");
            var podLinkUrl = UrlHelpers.join(projectLink(projectName), "namespace", ns, "pods");
            item.pods = [];
            item.$podCounters = Kubernetes.createPodCounters(selector, status.pods, item.pods, selectorText, podLinkUrl);
          }
        } else {
          log.warn("Missing project version metadata for RC " + ns + " / " + name + " project: " + project + " version: " + version);
        }
      });

      if (hasObjectChanged(projectInfos, cache)) {
        log.info("project versions has changed!");
        answer[ns] = projectInfos;
      }
    }

    Kubernetes.watch($scope, $element, "replicationcontrollers", ns, (data) => {
      if (data) {
        status.rcs = data;
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