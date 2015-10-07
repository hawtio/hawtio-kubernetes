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

  /**
   * Lets load the project versions for the given namespace
   */
  export function loadProjectVersions($scope, $http, project, env, ns) {
    var url = Kubernetes.resourcesUriForKind(Kubernetes.WatchTypes.REPLICATION_CONTROLLERS, ns) + "?labelSelector=project";

    var projectAnnotation = "project";
    var versionAnnotation = "version";

    $http.get(url).
      success(function (data, status, headers, config) {
        if (data) {
          var projectInfos = {};
          var projectNamespace = project.$namespace;
          var projectName = project.$name;

          env.projectVersions = projectInfos;
          angular.forEach(data.items, (item) => {
            var metadata = item.metadata || {};
            var name = metadata.name;
            var labels = metadata.labels || {};
            var annotations = metadata.annotations || {};

            var project = labels[projectAnnotation];
            var version = labels[versionAnnotation];
            if (project && version) {
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
                  replicationControllers: []
                };
                projects.versions[version] = versionInfo;
              }
              versionInfo.replicationControllers.push(item);
            }
            if (name) {
              item.$name = name;
              if (projectNamespace && projectName) {
                item.$viewLink = UrlHelpers.join("/workspaces/", projectNamespace, "projects", projectName, "namespace", ns, "replicationControllers", name);
              }
            }
            item.$buildId = annotations["fabric8.io/build-id"];
            item.$buildUrl = annotations["fabric8.io/build-url"];
            item.$gitCommit = annotations["fabric8.io/git-commit"];
            item.$gitUrl = annotations["fabric8.io/git-url"];
            item.$gitBranch = annotations["fabric8.io/git-branch"];
          });
          Core.$apply($scope);
        }
      }).
      error(function (data, status, headers, config) {
        log.warn("Failed to load " + url + " " + data + " " + status);
      });


  }
}