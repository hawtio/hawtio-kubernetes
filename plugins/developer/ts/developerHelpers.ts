/// <reference path="../../includes.ts"/>
module Developer {

  export var context = '/workspaces';
  export var hash = '#' + context;
  export var pluginName = 'Developer';
  export var pluginPath = 'plugins/developer/';
  export var templatePath = pluginPath + 'html/';
  export var log:Logging.Logger = Logger.get(pluginName);

  export var jenkinsServiceName = "jenkins";

  /**
   * Returns true if the value hasn't changed from the last cached JSON version of this object
   */
  export function hasObjectChanged(value, state) {
    var json = angular.toJson(value || "");
    var oldJson = state.json;
    state.json = json;
    return !oldJson || json !== oldJson;
  }

  export function enrichWorkspaces(projects) {
    angular.forEach(projects, (project) => {
      enrichWorkspace(project);
    });
    return projects;
  }

  export function enrichWorkspace(build) {
    if (build) {
      var name = Kubernetes.getName(build);
      build.$name = name;
      build.$sortOrder = 0 - build.number;

      var nameArray = name.split("-");
      var nameArrayLength = nameArray.length;
      build.$shortName = (nameArrayLength > 4) ? nameArray.slice(0, nameArrayLength - 4).join("-") : name.substring(0, 30);

      var labels = Kubernetes.getLabels(route);
      var creationTimestamp = Kubernetes.getCreationTimestamp(build);
      if (creationTimestamp) {
        var d = new Date(creationTimestamp);
        build.$creationDate = d;
      }
      if (name) {
        build.$viewLink = UrlHelpers.join("workspaces", name);
      }
    }
    return build;
  }

  function asDate(value) {
    return value ? new Date(value) : null;
  }

  export function enrichJenkinsJob(job, projectId) {
    if (job) {
      job.$project = projectId;
      angular.forEach(job.builds, (build) => {
        enrichJenkinsBuild(job, build);
      });
    }
    return job;
  }

  export function createBuildStatusIconClass(result) {
    var $iconClass = "fa fa-spinner fa-spin";
    if (result) {
      if (result === "FAILURE" || result === "FAILED") {
        // TODO not available yet
        $iconClass = "fa fa-exclamation-circle red";
      } else if (result === "ABORTED") {
        $iconClass = "fa fa-circle grey";
      } else if (result === "SUCCESS") {
        $iconClass = "fa fa-check-circle green";
      }
    }
    return $iconClass;
  }

  export function enrichJenkinsBuild(job, build) {
    if (build) {
      build.$duration = build.duration;
      build.$timestamp = asDate(build.timestamp);
      var jobName = job.name;
      var buildId = build.id;

      var $iconClass = createBuildStatusIconClass(build.result);
      var jobUrl = (job || {}).url;
      if (!jobUrl || !jobUrl.startsWith("http")) {
        var jenkinsUrl = jenkinsLink();
        if (jenkinsUrl) {
          jobUrl = UrlHelpers.join(jenkinsUrl, "job", jobName)
        }
      }
      if (jobUrl) {
        build.$jobLink = jobUrl;
        if (buildId) {
          build.$buildLink = UrlHelpers.join(jobUrl, build.id);
          build.$logsLink = UrlHelpers.join(build.$buildLink, "console");
          var workspaceName = Kubernetes.currentKubernetesNamespace();
          build.$pipelineLink = UrlHelpers.join("/workspaces", workspaceName, "projects", job.$project, "jenkinsJob", jobName, "pipeline", buildId);
        }
      }
      build.$iconClass = $iconClass;
    }
  }


  export function jenkinsLink() {
    var ServiceRegistry = Kubernetes.inject("ServiceRegistry");
    if (ServiceRegistry) {
      return ServiceRegistry.serviceLink(jenkinsServiceName);
    }
    return null;
  }

  export function enrichJenkinsPipelineJob(job) {
    if (job) {
      angular.forEach(job.builds, (build) => {
        enrichJenkinsStages(build);
      });
    }
  }

  export function enrichJenkinsStages(build) {
    if (build) {
      angular.forEach(build.stages, (stage) => {
        enrichJenkinsStage(stage);
      });
    }
    return build;
  }

  export function enrichJenkinsStage(stage) {
    if (stage) {
      stage.$iconClass = createBuildStatusIconClass(stage.status);
      stage.$startTime = asDate(stage.startTime);
      var jenkinsUrl = jenkinsLink();
      if (jenkinsUrl) {
        var url = stage.url;
        if (url) {
          stage.$viewLink = UrlHelpers.join(jenkinsUrl, url, "log");
        }
      }
    }
  }

  export function createWorkspaceBreadcrumbs(children = null, workspaceName = null) {
    var answer = [
      {
        href: "/workspaces",
        label: "Workspaces",
        title: "View all the workspaces"
      }
    ];
    if (!workspaceName) {
      workspaceName = Kubernetes.currentKubernetesNamespace();
    }
    if (workspaceName) {
      answer.push(
        {
          href: "/workspaces/" + workspaceName,
          label: workspaceName,
          title: "View the workspace: " + workspaceName
        }
      );
      return processChildren(answer, children);
    }
    return answer;
  }


  export function createEnvironmentBreadcrumbs($scope, $location, $routeParams) {
    var ns = Kubernetes.currentKubernetesNamespace();
    var namespacesLink = "/kubernetes/namespace";
    var workspaceName = $routeParams.workspace;
    var project = $routeParams.project;
    if (workspaceName && project) {
      var projectLink = UrlHelpers.join("/workspaces", workspaceName, "projects", project);
      namespacesLink = UrlHelpers.join(projectLink, "namespace");
      // TODO use the logical name?
      var envName = ns;
      var buildConfig = null;
      if ($scope.model) {
        buildConfig = $scope.model.getProject(project, workspaceName);
        if (buildConfig) {
          // lets find the label for the namespace
          var env = _.find(buildConfig.environments, { namespace: ns});
          if (env) {
            envName = env['label'] || envName;
          }
          log.info("env found: " + env + " for nameppace " + ns + " on buildConfig: " + buildConfig);
        }
      }
      var children = [
          {
            href: UrlHelpers.join(projectLink, "environments"),
            label: "Environments",
            title: "View the environments for this project"
          },
          {
            href: UrlHelpers.join(namespacesLink, ns, "apps"),
            label: envName,
            title: "View the runtime of the workspace: " + ns
          }
          ];
      return createProjectBreadcrumbs(project, children, workspaceName);
    }
    return createWorkspaceBreadcrumbs([
      {
        href: UrlHelpers.join(namespacesLink, ns, "apps"),
        label: "Runtime",
        title: "View the runtime of the workspace: " + ns
      }
    ]);
  }

  export function createProjectBreadcrumbs(projectName = null, children = null, workspaceName = null) {
    if (!workspaceName) {
      workspaceName = Kubernetes.currentKubernetesNamespace();
    }
    var answer = createWorkspaceBreadcrumbs(null, workspaceName);
    if (workspaceName) {
      if (projectName) {
        answer.push(
          {
            href: UrlHelpers.join("/workspaces", workspaceName, "projects"),
            label: "Projects",
            title: "View all the projects"
          }
        );

        answer.push(
          {
            href: UrlHelpers.join("/workspaces", workspaceName, "projects", projectName),
            label: projectName,
            title: "View the project: " + projectName
          }
        );
      }
      return processChildren(answer, children);
    }
    return answer;
  }

  export function createWorkspaceSubNavBars() {
    var workspaceName = Kubernetes.currentKubernetesNamespace();
    return activateCurrent([
      {
        href: UrlHelpers.join("/workspaces", workspaceName),
        label: "Projects",
        title: "View the projects for this workspace"
      },
      {
        href: UrlHelpers.join("/kubernetes/namespace", workspaceName, "apps"),
        label: "Runtime",
        title: "View the runtime environment for this workspace"
      },
      {
        href: UrlHelpers.join("/workspaces", workspaceName, "detail"),
        label: "Detail",
        title: "View the workspace detail"
      }
    ]);
  }

  export function createProjectSubNavBars(projectName, jenkinsJobId = null) {
    var workspaceName = Kubernetes.currentKubernetesNamespace();
    var buildsLink = UrlHelpers.join("/workspaces", workspaceName, "projects", projectName, "builds");
    var pipelines = null;
    if (!jenkinsJobId) {
      jenkinsJobId = projectName;
    }
    if (projectName && jenkinsJobId) {
      buildsLink = UrlHelpers.join("/workspaces", Kubernetes.currentKubernetesNamespace(), "projects", projectName, "jenkinsJob", jenkinsJobId);
      var pipelinesLink = UrlHelpers.join(buildsLink, "pipelines");
      pipelines = {
        id: "pipelines",
        href: pipelinesLink,
        label: "Pipelines",
        title: "View the pipeline builds for this project"
      };
    }


    return activateCurrent([
      {
        id: "builds",
        href: buildsLink,
        label: "Builds",
        title: "View the builds for this project"
      },
      pipelines,
      {
        href: UrlHelpers.join("/workspaces", workspaceName, "projects", projectName, "environments"),
        //href: UrlHelpers.join("/workspaces", workspaceName, "projects", projectName),
        label: "Environments",
        title: "View the environments for this project"
      },
      {
        href: UrlHelpers.join("/workspaces", workspaceName, "projects", projectName, "tools"),
        label: "Tools",
        title: "View the tools for this project"
      },
      {
        href: UrlHelpers.join("/workspaces", workspaceName, "projects", projectName, "detail"),
        label: "Detail",
        title: "View the project detail"
      }
    ]);
  }


  export function createEnvironmentSubNavBars($scope, $location, $routeParams) {
    var ns = Kubernetes.currentKubernetesNamespace();
    var workspaceName = $routeParams.workspace;
    var project = $routeParams.project;
    var projectLink = "/kubernetes";
    if (workspaceName && project) {
      projectLink = UrlHelpers.join("/workspaces", workspaceName, "projects", project);
    }
    var namespacesLink = UrlHelpers.join(projectLink, "namespace");
    return activateCurrent([
      {
        href: UrlHelpers.join(namespacesLink, ns),
        label: "Apps",
        title: "View the apps for this workspace"
      },
      {
        href: UrlHelpers.join(namespacesLink, ns, "services"),
        label: "Services",
        title: "View the apps for this workspace"
      },
      {
        href: UrlHelpers.join(namespacesLink, ns, "replicationControllers"),
        label: "Controllers",
        title: "View the Replication Controllers for this workspace"
      },
      {
        href: UrlHelpers.join(namespacesLink, ns, "pods"),
        label: "Pods",
        title: "View the pods for this workspace"
      },
      {
        href: UrlHelpers.join("/kubernetes/hosts"),
        label: "Nodes",
        title: "View the nodes for this workspace"
      },
      {
        href: UrlHelpers.join(namespacesLink, ns, "angryPods"),
        label: "Angry Pods",
        title: "Try the Angry Pods game!"
      },
    ]);
  }


  /**
   * Removes the URL query string if its inside the given text
   */
  function trimQuery(text) {
    if (text) {
      var idx = text.indexOf("?");
      if (idx >= 0) {
        return text.substring(0, idx);
      }
    }
    return text;
  }

  function activateCurrent(navBarItems) {
    navBarItems = _.compact(navBarItems);
    var injector = HawtioCore.injector;
    var $location = injector ? injector.get("$location") : null;
    if ($location) {
      var path = trimQuery($location.path());
      var found = false;
      angular.forEach(navBarItems, (item) => {
        if (item) {
          var href = item.href;
          var trimHref = trimQuery(href);
          if (!found && trimHref && trimHref === path) {
            item.active = true;
            found = true;
          }
        }
      });
    }
    return navBarItems;
  }

  function processChildren(answer, children) {
    if (children) {
      if (angular.isArray(children)) {
        answer = answer.concat(children);
      } else {
        answer.push(children);
      }
    }
    activateCurrent(answer);
    return answer;
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