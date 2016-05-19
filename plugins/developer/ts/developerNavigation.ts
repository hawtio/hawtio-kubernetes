/// <reference path="../../includes.ts"/>
module Developer {

  var log = Logger.get('developer-navigation');

  export type LabelResolver = () => string;

  export interface BreadcrumbConfig {
      href?: string;
      label?: string | LabelResolver;
      title?: string;
      class?: string;
      isValid?: () => boolean;
      isActive?: (subTab, path) => boolean;
  }


  function developBreadcrumb() : BreadcrumbConfig {
    return {
      href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces"),
      label: "Teams",
      title: "View all the available teams",
      isActive: (subTab, path) => false
    };
  }

  function operateBreadcrumb() : BreadcrumbConfig {
    return {
      href: UrlHelpers.join(HawtioCore.documentBase(), "/namespaces"),
      label: "Manage",
      title: "Manage the projects and resources inside them"
    };
  }

  export function workspaceLink() {
    return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", Kubernetes.currentKubernetesNamespace());
  }

  export function projectLink(projectId) {
    var link = workspaceLink();
    if (projectId) {
      return UrlHelpers.join(link, "/projects", projectId);
    } else {
      return link;
    }
  }

  export function createWorkspacesBreadcrumbs(developPerspective?) {
    return [developBreadcrumb()];
  }


  export function createWorkspacesSubNavBars(developPerspective) {
      return activateCurrent([
        developBreadcrumb(),
        operateBreadcrumb()
      ]);
  }

  export function createWorkspaceBreadcrumbs(children = null, workspaceName = null) {
    var answer = createWorkspacesBreadcrumbs(true);
    if (!workspaceName) {
      workspaceName = Kubernetes.currentKubernetesNamespace();
    }
    if (workspaceName) {
      answer.push(
        {
          href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces/", workspaceName),
          label: workspaceName,
          title: "View the project: " + workspaceName,
          isActive: (subTab, path) => false
        }
      );
      return processChildren(answer, children);
    }
    return answer;
  }


  export function createEnvironmentBreadcrumbs($scope, $location, $routeParams) {
    var ns = Kubernetes.currentKubernetesNamespace();
    var namespacesLink = UrlHelpers.join(HawtioCore.documentBase(), "/kubernetes/namespace");
    var workspaceName = $routeParams.workspace;
    var project = $routeParams.project;
    var environment = $routeParams.namespace;
    if (workspaceName && project) {
      var projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", project);
      $scope.$projectLink = projectLink;
      $scope.$projectNamespaceLink = UrlHelpers.join(projectLink, "namespace", ns);
      namespacesLink = UrlHelpers.join(projectLink, "namespace");
      var children: Array<BreadcrumbConfig> = [
        {
          href: UrlHelpers.join(projectLink, "environments"),
          label: "Environments",
          title: "View the environments for this project"
        },
        {
          href: UrlHelpers.join(namespacesLink, ns, "apps"),
          label: () =>  environmentName(workspaceName, ns),
          title: "View the runtime of the workspace: " + ns
        }
      ];
      return createProjectBreadcrumbs(project, children, workspaceName);
    } else if (workspaceName && environment && workspaceName != environment) {
      // find label for namespace environment
      var children: Array<BreadcrumbConfig> = [
        {
          href: environmentsLink(workspaceName),
          label: "Environments",
          title: "View the environments for this project"
        },
        {
          href: environmentLink(workspaceName, environment),
          label: () =>  environmentName(workspaceName, environment),
          title: "View this environment"
        }
      ];
      return createProjectBreadcrumbs(project, children, workspaceName);
    } else if (!workspaceName) {
      workspaceName = Kubernetes.currentKubernetesNamespace();
    }
    var answer = createWorkspaceBreadcrumbs(workspaceName);
    answer.push({
      href: UrlHelpers.join(HawtioCore.documentBase(), "workspaces", workspaceName, "namespace", ns, "apps"),
      label: 'Runtime',
      title: "View the runtime of the workspace: " + ns
    });
    return activateCurrent(answer);
  }

  /**
   * Returns the name of the given environment namespace
   */
  function environmentName(workspaceName, environment) {
    var model = Kubernetes.getKubernetesModel();
    if (model) {
      return model.environmentName(workspaceName, environment);
    }
    return environment;
  }

  export function createProjectBreadcrumbs(projectName = null, children: Array<BreadcrumbConfig> = null, workspaceName = null) {
    if (!workspaceName) {
      workspaceName = Kubernetes.currentKubernetesNamespace();
    }
    var answer = createWorkspaceBreadcrumbs(null, workspaceName);
    if (workspaceName) {
      if (projectName) {
        answer.push(
          {
            href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects"),
            label: "Apps",
            title: "View all the apps in this project"
          }
        );

        answer.push(
          {
            href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName),
            label: projectName,
            title: "View the project: " + projectName
          }
        );
      }
      return processChildren(answer, children);
    }
    return answer;
  }


  export function createProjectSettingsBreadcrumbs(projectName, workspaceName = null) {
    var children = [{
      label: "Settings",
      title: "View the settings of this app"
    }];
    if (!projectName) {
      var children = [{
        label: "New App",
        title: "Lets make a new app"
      }];
    }
    return createProjectBreadcrumbs(projectName, children, workspaceName);
  }


  export function createWorkspaceSubNavBars() {
    var workspaceName = Kubernetes.currentKubernetesNamespace();
    return activateCurrent([
      {
        href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName),
        label: "Dashboard",
        class: "fa fa-tachometer",
        title: "View the dashboard for the apps, environments and pipelines in this project"
      },
      {
        href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "apps"),
        label: "Apps",
        class: "fa fa-rocket",
        title: "View the apps in this project"
      },
      {
        isValid: () => jenkinsLink(),
        href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "jenkinsJob"),
        label: "Builds",
        class: "fa fa-code",
        title: "View the builds in this project"
      },
      {
        href: environmentsLink(),
        label: "Environments",
        class: "fa fa-cubes",
        title: "View the environments for this project"
      },
      {
        href: namespaceRuntimeLink(workspaceName),
        label: "Runtime",
        class: "fa fa-cube",
        title: "View the Runtime perspective for this project"
      }
/*
      {
        href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "detail"),
        label: "Details",
        class: "fa fa-gear",
        title: "View the project details"
      }
*/
    ]);
  }

  export function namespaceRuntimeLink(workspaceName = null) {
    if (!workspaceName) {
      workspaceName = Kubernetes.currentKubernetesNamespace();
    }
    return UrlHelpers.join(HawtioCore.documentBase(), "workspaces", workspaceName, "namespace", workspaceName, "apps");
  }
  
  function createBuildsLink(workspaceName, projectName, jenkinsJobId) {
    workspaceName = workspaceName || Kubernetes.currentKubernetesNamespace();
    return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName, "jenkinsJob", jenkinsJobId);
  }

  /**
   * Creates a routing function that loads a template and inject the needed directives to properly
   * display/update the Developer module managed tabs and bread crumbs for when the route is active.
   *
   * Example Usage:
   *
   * var route = Developer.createTabRoutingFunction("/app/somedir");
   * $routeProvider.when('/profiles', route('view.html', false, [{
   *     label: "Profiles",
   *     title: "Browse the profiles of this project"
   *   }]
   * ));
   *
   * @param baseURL
   * @returns {function(string, boolean=, Array<Developer.BreadcrumbConfig>=): {template: string, reloadOnSearch: boolean, controller: string|string|(function(any, ng.route.IRouteParamsService): undefined)[]}}
   */
  export function createTabRoutingFunction(baseURL:string) {
    return (templateName:string, reloadOnSearch:boolean = true, children?: Array<Developer.BreadcrumbConfig>) => {
      return {
        template: "<div hawtio-breadcrumbs></div><div hawtio-tabs></div><ng-include src='contentTemplateUrl'></ng-include>",
        reloadOnSearch: reloadOnSearch,
        controller: ["$scope", "$routeParams", ($scope, $routeParams:ng.route.IRouteParamsService) => {
          if( $routeParams["namespace"]==null ) {
            log.error("The :namespace route parameter was not defined for the route.");
          }
          if( $routeParams["projectId"] == null ) {
            log.error("The :projectId route parameter was not defined for the route.");
          }
          $scope.namespace = $routeParams["namespace"];
          $scope.projectId = $routeParams["projectId"];
          $scope.contentTemplateUrl = UrlHelpers.join(baseURL, templateName);
          $scope.breadcrumbConfig = Developer.createProjectBreadcrumbs($scope.projectId, children);
          $scope.subTabConfig = Developer.createProjectSubNavBars($scope.projectId);
        }]
      };
    }
  }

  export function createProjectSubNavBars(projectName, jenkinsJobId = null, $scope = null) {
    var workspaceName = Kubernetes.currentKubernetesNamespace();
    var projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName);
    var buildsLink = UrlHelpers.join(projectLink, "builds");
    if (!jenkinsJobId) {
      jenkinsJobId = projectName;
    }
    var jenkinsBuildLink = null;
    var pipelinesLink = null;
    if (projectName && jenkinsJobId) {
      jenkinsBuildLink = createBuildsLink(workspaceName, projectName, jenkinsJobId);
      pipelinesLink = UrlHelpers.join(jenkinsBuildLink, "pipelines");
    }

    function isJenkinsBuild() {
      var answer = jenkinsLink() && jenkinsBuildLink;
      if (answer && $scope) {
        var entity = Developer.projectForScope($scope);
        if (entity) {
          return answer && entity.$jenkinsJob;
        }
      }
      return answer;
    }

    var answer = [
      /*
      {
        href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName),
        label: "All Apps",
        class: 'fa fa-angle-double-left',
        title: "View the apps in this project"
      },
      {
        template: `<div ng-include="'plugins/developer/html/projectSelector.html'"></div>`
      },
*/
      {
        href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName, "environments"),
        isActive: (subTab, path) => {
          var href = normalizeHref(subTab.href);
          //console.log("subTab: ", subTab, " path: ", path);
          if (path === href) {
            return true;
          }
          var rootPath = href.replace(/\/environments/, '');
          if (path === rootPath) {
            return true;
          }
          return false;
        },
        //href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName),
        label: "Dashboard",
        class: "fa fa-tachometer",
        title: "View the app dashboard for the activity, environments and pipelines"
      },
      {
        isValid: () => isJenkinsBuild() && pipelinesLink,
        id: "pipelines",
        href: pipelinesLink,
        label: "Pipelines",
        class: "fa fa-ellipsis-h",
        title: "View the pipeline builds for this app"
      },
      {
        isValid: () => !isJenkinsBuild(),
        href: buildsLink,
        label: "Builds",
        class: "fa fa-bars",
        title: "View the builds for this app"
      },
      {
        isValid: () => isJenkinsBuild(),
        id: "builds",
        href: jenkinsBuildLink,
        label: "Builds",
        class: "fa fa-bars",
        title: "View the Jenkins builds for this app"
      },
      {
        isValid: () => isJenkinsBuild(),
        href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName, "jenkinsJob", jenkinsJobId, "metrics"),
        label: "Metrics",
        class: "fa fa-bar-chart",
        title: "View the metrics for this project"
      },
/*
      {
        href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName, "tools"),
        label: "Tools",
        title: "View the tools for this project"
      },
*/
      {
        href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName, "buildConfigEdit"),
        label: "Settings",
        class: "fa fa-cog",
        title: "View the app configuration",
        isActive: (subTab, path) => {
          if (_.endsWith(path, '/buildConfigEdit')) {
            return true;
          }
          if (_.endsWith(path, '/forge/secrets')) {
            return true;
          }
          if (_.endsWith(path, '/forge/command/devops-edit')) {
            return true;
          }
          return false;
        }
      }
    ];

    var context = {
      workspaceName: workspaceName,
      projectName: projectName,
      projectLink: projectLink,
      jenkinsJobId: jenkinsJobId,
      $scope: $scope
    };
    angular.forEach(customProjectSubTabFactories, (fn) => {
      if (angular.isFunction(fn)) {
        var subtab = fn(context);
        if (subtab) {
          if (angular.isArray(subtab)) {
            angular.forEach(subtab, (t) => {
              answer.push(t);
            });
          } else {
            answer.push(subtab);
          }
        }
      }
    });

    return activateCurrent(answer);
  }

  export function createProjectSettingsSubNavBars(projectName, jenkinsJobId = null) {
    if (!projectName) {
      return [];
    }
    var workspaceName = Kubernetes.currentKubernetesNamespace();
    var projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName);
    if (!jenkinsJobId) {
      jenkinsJobId = projectName;
    }
    var answer = [
      {
        href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName, "buildConfigEdit"),
        label: "Core",
        title: "View the core build configuration"
      },
      {
        href: projectSecretsLink(workspaceName, projectName),
        label: "Secrets",
        title: "View or change the secrets used to edit source code in the source control system"
      },
      {
        href: editPipelineLink(workspaceName, projectName),
        label: "Pipeline",
        title: "View the DevOps and pipeline configuration"
      },
      {
        isValid: () => forgeProjectHasBuilder("maven"),
        href: editMavenBuildLink(workspaceName, projectName),
        label: "Maven",
        title: "View the Maven build configuration"
      }
    ];
    return activateCurrent(answer);
  }

  export function forgeProjectHasBuilder(name) {
    var forgeProject = Kubernetes.inject<any>("ForgeProject");
    if (forgeProject) {
      return forgeProject.hasBuilder(name);
    }
    return false;
  }

  export function forgeProjectHasPerspective(name) {
    var forgeProject = Kubernetes.inject<any>("ForgeProject");
    if (forgeProject) {
      return forgeProject.hasPerspective(name);
    }
    return false;
  }

  export function editPipelineLinkScope($scope) {
    return editPipelineLink($scope.namespace, $scope.projectId || $scope.projectName || $scope.project);
  }

  export function createProjectLink(workspaceName = null) {
    if (!workspaceName) {
      workspaceName = Kubernetes.currentKubernetesNamespace();
    }
    return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "/forge/createProject");
  }

  export function editPipelineLink(workspaceName, projectName) {
    return projectWorkspaceLink(workspaceName, projectName, "forge/command/devops-edit");
  }

  export function editMavenBuildLink(workspaceName, projectName) {
    return projectWorkspaceLink(workspaceName, projectName, "forge/command/fabric8-setup");
  }

  export function projectSecretsLink(workspaceName, projectName) {
    return projectWorkspaceLink(workspaceName, projectName, "forge/secrets", false);
  }

  export function secretsNamespaceLink(workspaceName, projectName, secretsNamespace) {
    var prefix = projectWorkspaceLink(workspaceName, projectName, "") || "kubernetes";
    return UrlHelpers.join(prefix, "namespace", secretsNamespace, "secrets");
  }

  export function projectWorkspaceLink(workspaceName, projectName, path, ignoreBlankProject = true) {
    if (ignoreBlankProject && !projectName) {
      return "";
    }
    if (!workspaceName) {
      workspaceName = Kubernetes.currentKubernetesNamespace();
    }
    return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", projectName, path);
  }

  export function environmentsLink(workspaceName = null) {
    if (!workspaceName) {
      workspaceName = Kubernetes.currentKubernetesNamespace();
    }
    return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "environments")
  }

  export function environmentLink(workspaceName, environmentNamespace, path = "", ignoreBlankProject = true) {
    if (ignoreBlankProject && !environmentNamespace) {
      return "";
    }
    if (!workspaceName) {
      workspaceName = Kubernetes.currentKubernetesNamespace();
    }
    return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "namespace", environmentNamespace, path);
  }

  export var customProjectSubTabFactories = [];

  export function createJenkinsBreadcrumbs(projectName, jobId, buildId) {
    var workspaceName = Kubernetes.currentKubernetesNamespace();
    var children = [
      {
        id: "builds",
        href: createBuildsLink(workspaceName, projectName, jobId),
        label: "Builds",
        title: "View the builds for this app"
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
    var environment = $routeParams.namespace;
    var projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/kubernetes");
    if (workspaceName && project) {
      projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", project);
    } else {
      projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName || ns);
    }
    var namespacesLink = UrlHelpers.join(projectLink, "namespace");
    return activateCurrent([
      {
        href: UrlHelpers.join(namespacesLink, ns, "apps"),
        isActive: (tab, path) => {
          var href = normalizeHref(tab.href);
          if (href === path) {
            return true;
          }
          if (href.replace(path, '') === '/apps') {
            return true;
          }
          return false;
        },
        label: "Overview",
        class: "fa fa-list",
        title: "Overview of all the apps for this project"
      },
      {
        href: UrlHelpers.join(namespacesLink, ns, "services"),
        label: "Services",
        class: "fa fa-plug",
        title: "View the apps for this project"
      },
      {
        href: UrlHelpers.join(namespacesLink, ns, "replicationControllers"),
        label: "Replicas",
        class: "fa fa-clone",
        title: "View the Replicas for this project"
      },
      {
        href: UrlHelpers.join(namespacesLink, ns, "pods"),
        label: "Pods",
        class: "fa fa-puzzle-piece",
        title: "View the pods for this project"
      },
      {
        href: UrlHelpers.join(namespacesLink, ns, "configMaps"),
        label: "Config",
        class: "fa fa-cogs",
        title: "View the config maps for this project"
      },
      {
        href: UrlHelpers.join(namespacesLink, ns, "events"),
        label: "Events",
        class: "fa fa-newspaper-o",
        title: "View the events for this project"
      },
      {
        href: UrlHelpers.join(namespacesLink, ns, "secrets"),
        label: "Secrets",
        class: "fa fa-key",
        title: "View the secrets for this project"
      },
      {
        href: UrlHelpers.join(namespacesLink, ns, "hosts"),
        label: "Nodes",
        class: "fa fa-server",
        title: "View the nodes for this project"
      },
      {
        href: UrlHelpers.join(namespacesLink, ns, "overview"),
        label: "Diagram",
        class: "fa fa-sitemap",
        title: "View all the objects in this project and their relationship"
      },
      {
        href: UrlHelpers.join(namespacesLink, ns, "angryPods"),
        label: "Angry Pods",
        class: "fa fa-gamepad",
        title: "Try the Angry Pods game!"
      },
      {
        href: UrlHelpers.join(projectLink, "environments"),
        label: "Dashboard",
        class: "fa fa-tachometer",
        title: "View the dashboard for this App",
        isValid: () => project
      },
      {
        href: UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName || environment),
        label: "Dashboard",
        class: "fa fa-tachometer",
        title: "View the dashboard for this project",
        isValid: () => {
          // only valid if we showing a top level project which is not inside a nested environment
          //return !project && (!workspaceName || workspaceName !== environment);
          return !project;
        }
      }
    ]);
  }

  export function environmentInstanceLink(env, projectName = null) {
    if (env) {
      var envNamespace = env["namespace"];
      if (envNamespace) {
        if (projectName) {
          return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", Kubernetes.currentKubernetesNamespace(), "projects", projectName, "namespace", envNamespace);
        } else {
          return UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", Kubernetes.currentKubernetesNamespace(), "namespace", envNamespace);
        }
      }
    }
    return "";
  }


  export function namespaceLink($scope, $routeParams, path = null) {
    var ns = Kubernetes.currentKubernetesNamespace();
    var workspaceName = $routeParams.workspace;
    var project = $routeParams.project;
    var projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/kubernetes");
    if (workspaceName && project) {
      projectLink = UrlHelpers.join(HawtioCore.documentBase(), "/workspaces", workspaceName, "projects", project);
    }
    return UrlHelpers.join(projectLink, "namespace", ns, path);
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

  // Cater for the app running at some weird document base
  export function normalizeHref(href:string) {
    if (!href) {
      return null;
    }
    var regex = new RegExp('^' + HawtioCore.documentBase().replace('/', '\\/'));
    return href.replace(regex, '/');
  }

  function activateCurrent(navBarItems) {
    navBarItems = _.compact(navBarItems);
    var injector = HawtioCore.injector;
    var $location = injector ? injector.get<ng.ILocationService>("$location") : null;
    if ($location) {
      var path = normalizeHref(trimQuery($location.path()));
      var found = false;
      function makeActive(item) {
        item.active = true;
        found = true;
      }
      function getHref(item) {
        var href = item.href;
        var trimHref = trimQuery(href);
        return normalizeHref(trimHref);
      }
      angular.forEach(navBarItems, (item) => {
        if (!found && item) {
          if (angular.isFunction(item.isActive)) {
            if (item.isActive(item, path)) {
              makeActive(item);
            }
          } else {
            var trimHref = getHref(item);
            if (!trimHref) {
              return;
            }
            if (trimHref === path) {
              makeActive(item);
            }
          }
        }
      });
      // Maybe it's a sub-item of a tab, let's fall back to that maybe
      if (!found) {
        angular.forEach(navBarItems, (item) => {
          if (!found) {
            if (!angular.isFunction(item.isActive)) {
              var trimHref = getHref(item);
              if (!trimHref) {
                return;
              }
              if (_.startsWith(path, trimHref)) {
                makeActive(item);
              }
            }
          }
        });
      }
      // still not found, let's log it
      if (!found) {
        log.debug("No navigation tab found for path:", path);
      }
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
