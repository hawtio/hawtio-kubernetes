/// <reference path="../../includes.ts"/>
module Developer {

/*
  function homeBreadcrumb() {
    return {
      href: "/home",
      label: "Home",
      title: "Go to the home page"
    }
  }
*/
  function developBreadcrumb() {
    return {
      href: "/workspaces",
      label: "Develop",
      title: "View all the developer workspaces"
    };
  }
  function operateBreadcrumb() {
    return {
      href: "/namespaces",
      label: "Manage",
      title: "Manage the namespaces and resources inside them"
    };
  }

  export function workspaceLink() {
    return UrlHelpers.join("/workspaces", Kubernetes.currentKubernetesNamespace());
  }

  export function projectLink(projectId) {
    var link = workspaceLink();
    if (projectId) {
      return UrlHelpers.join(link, "/projects", projectId);
    } else {
      return link;
    }
  }

  export function createWorkspacesBreadcrumbs(developPerspective) {
/*
    if (developPerspective) {
      return [
        //homeBreadcrumb(),
        developBreadcrumb()
      ];
    } else {
      return [
        //homeBreadcrumb(),
        operateBreadcrumb()
      ];
    }
*/
    return [];
  }


  export function createWorkspacesSubNavBars(developPerspective) {
      return activateCurrent([
        developBreadcrumb(),
        operateBreadcrumb()
      ]);
  }

  export function createWorkspaceBreadcrumbs(children = null, workspaceName = null) {
    var answer = [
      //homeBreadcrumb(),
      developBreadcrumb()
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
    } else {
      if (!workspaceName) {
        workspaceName = Kubernetes.currentKubernetesNamespace();
      }
      return activateCurrent([
        //homeBreadcrumb(),
        operateBreadcrumb(),
        {
          href: UrlHelpers.join(namespacesLink, ns, "apps"),
          label: workspaceName,
          title: "View the runtime of the workspace: " + ns
        }
      ]);
    }
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
        isValid: () => jenkinsLink(),
        href: UrlHelpers.join("/workspaces", workspaceName, "jenkinsJob"),
        label: "Builds",
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

  function createBuildsLink(workspaceName, projectName, jenkinsJobId) {
    workspaceName = workspaceName || Kubernetes.currentKubernetesNamespace();
    return UrlHelpers.join("/workspaces", workspaceName, "projects", projectName, "jenkinsJob", jenkinsJobId);
  }

  export function createProjectSubNavBars(projectName, jenkinsJobId = null) {
    var workspaceName = Kubernetes.currentKubernetesNamespace();
    var buildsLink = UrlHelpers.join("/workspaces", workspaceName, "projects", projectName, "builds");
    var pipelines = null;
    if (!jenkinsJobId) {
      jenkinsJobId = projectName;
    }
    if (projectName && jenkinsJobId) {
      buildsLink = createBuildsLink(workspaceName, projectName, jenkinsJobId);
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
        href: UrlHelpers.join("/workspaces", workspaceName, "projects", projectName, "environments"),
        //href: UrlHelpers.join("/workspaces", workspaceName, "projects", projectName),
        label: "Overview",
        title: "View the overview of this project, its actiity, environments and pipelines"
      },
      pipelines,
      {
        id: "builds",
        href: buildsLink,
        label: "Builds",
        title: "View the builds for this project"
      },
      {
        isValid: () => jenkinsLink(),
        href: UrlHelpers.join("/workspaces", workspaceName, "projects", projectName, "jenkinsJob", jenkinsJobId, "metrics"),
        label: "Metrics",
        title: "View the metrics for this project"
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

  export function createJenkinsBreadcrumbs(projectName, jobId, buildId) {
    var workspaceName = Kubernetes.currentKubernetesNamespace();
    var children = [
      {
        id: "builds",
        href: createBuildsLink(workspaceName, projectName, jobId),
        label: "Builds",
        title: "View the builds for this project"
      }
    ];
    if (buildId) {
      children.push({
        id: "",
        href: "",
        label: "#" + buildId,
        title: "Build #" + buildId
      });
    }
    return createProjectBreadcrumbs(projectName, children);
  }

  export function createJenkinsSubNavBars(projectName, jenkinsJobId, buildId, extraOption: any = null) {
    var answer = createProjectSubNavBars(projectName, jenkinsJobId);
    if (extraOption) {
      extraOption.active = true;
      answer.push(extraOption);
    }
    return answer;
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
        href: UrlHelpers.join(namespacesLink, ns, "apps"),
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
}