/// <reference path="../../includes.ts"/>
module Developer {

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
}