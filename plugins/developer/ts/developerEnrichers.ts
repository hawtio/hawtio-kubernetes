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

      var labels = Kubernetes.getLabels(build);
      build.$creationDate = asDate(Kubernetes.getCreationTimestamp(build));
      build.$labelsText = Kubernetes.labelsToString(labels);

      if (name) {
        build.$projectsLink = UrlHelpers.join("workspaces", name);
        build.$runtimeLink = UrlHelpers.join("kubernetes/namespace/", name, "/apps");
        build.$viewLink = build.$projectsLink;
      }
    }
    return build;
  }

  export function asDate(value) {
    return value ? new Date(value) : null;
  }

  export function enrichJenkinsJobs(jobsData, projectId, jobName) {
    if (jobsData) {
      angular.forEach(jobsData.jobs, (job) => {
        enrichJenkinsJob(job, projectId, jobName);
      });
    }
    return jobsData;
  }

  export function enrichJenkinsJob(job, projectId, jobName) {
    if (job) {
      jobName = jobName || job.name || projectId;
      job.$jobId = jobName;
      job.$project = projectId || jobName;
      var lastBuild = job.lastBuild;
      var lastBuildResult = lastBuild ? lastBuild.result : "NOT_STARTED";
      var $iconClass = createBuildStatusIconClass(lastBuildResult);

      job.$lastBuildNumber = enrichJenkinsBuild(job, lastBuild);
      job.$lastSuccessfulBuildNumber = enrichJenkinsBuild(job, job.lastSuccessfulBuild);
      job.$lastFailedlBuildNumber = enrichJenkinsBuild(job, job.lastFailedlBuild);

      if (lastBuild) {
        job.$duration = lastBuild.duration;
        job.$timestamp = asDate(lastBuild.timestamp);
      }
      var jobUrl = (job || {}).url;
      if (!jobUrl || !jobUrl.startsWith("http")) {
        var jenkinsUrl = jenkinsLink();
        if (jenkinsUrl) {
          jobUrl = UrlHelpers.join(jenkinsUrl, "job", jobName)
        }
      }
      if (jobUrl) {
        job.$jobLink = jobUrl;
        var workspaceName = Kubernetes.currentKubernetesNamespace();
        job.$pipelinesLink = UrlHelpers.join("/workspaces", workspaceName, "projects", job.$project, "jenkinsJob", jobName, "pipelines");
        job.$buildsLink = UrlHelpers.join("/workspaces", workspaceName, "projects", job.$project, "jenkinsJob", jobName);
      }
      job.$iconClass = $iconClass;

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
      } else if (result === "ABORTED" || result === "INTERUPTED") {
        $iconClass = "fa fa-circle grey";
      } else if (result === "SUCCESS") {
        $iconClass = "fa fa-check-circle green";
      } else if (result === "NOT_STARTED") {
        $iconClass = "fa fa-circle-thin grey";
      }
    }
    return $iconClass;
  }

  export function createBuildStatusBackgroundClass(result) {
    var $iconClass = "build-pending";
    if (result) {
      if (result === "FAILURE" || result === "FAILED") {
        $iconClass = "build-fail";
      } else if (result === "ABORTED" || result === "INTERUPTED") {
        $iconClass = "build-aborted";
      } else if (result === "SUCCESS") {
        $iconClass = "build-success";
      } else if (result === "NOT_STARTED") {
        $iconClass = "build-not-started";
      }
    }
    return $iconClass;
  }

  export function enrichJenkinsBuild(job, build) {
    var number = null;
    if (build) {
      build.$duration = build.duration;
      build.$timestamp = asDate(build.timestamp);
      var projectId = job.$project;
      var jobName = job.$jobId || projectId;
      var buildId = build.id;
      number = build.number;
      var workspaceName = Kubernetes.currentKubernetesNamespace();

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
          //build.$logsLink = UrlHelpers.join(build.$buildLink, "console");
          build.$logsLink = UrlHelpers.join("/workspaces", workspaceName, "projects", projectId, "jenkinsJob", jobName, "log", buildId);
          build.$pipelineLink = UrlHelpers.join("/workspaces", workspaceName, "projects", projectId, "jenkinsJob", jobName, "pipeline", buildId);
          build.$buildsLink = UrlHelpers.join("/workspaces", workspaceName, "projects", projectId, "jenkinsJob", jobName);
          //build.$buildLink = UrlHelpers.join(jobUrl, build.id);
          build.$buildLink = build.$logsLink;
        }
      }
      build.$iconClass = $iconClass;
    }
    return number;
  }


  export function jenkinsLink() {
    var ServiceRegistry = Kubernetes.inject("ServiceRegistry");
    if (ServiceRegistry) {
      return ServiceRegistry.serviceLink(jenkinsServiceName);
    }
    return null;
  }

  export function enrichJenkinsPipelineJob(job, projectId, jobId) {
    if (job) {
      job.$project = projectId;
      job.$jobId = jobId;
      angular.forEach(job.builds, (build) => {
        enrichJenkinsStages(build, projectId, jobId);
      });
    }
  }

  export function enrichJenkinsStages(build, projectId, jobName) {
    if (build) {
      build.$project = projectId;
      build.$jobId = jobName;
      build.$timestamp = asDate(build.timeInMillis);
      var workspaceName = Kubernetes.currentKubernetesNamespace();
      var parameters = build.parameters;
      var $parameterCount = 0;
      var $parameterText = "No parameters";
      if (parameters) {
        $parameterCount = _.keys(parameters).length || 0;
        $parameterText = Kubernetes.labelsToString(parameters, " ");
      }
      build.$parameterCount = $parameterCount;
      build.$parameterText = $parameterText;
      var jenkinsUrl = jenkinsLink();
      if (jenkinsUrl) {
        var url = build.url;
        if (url) {
/*
          build.$viewLink = UrlHelpers.join(jenkinsUrl, url);
          build.$logLink = UrlHelpers.join(build.$viewLink, "log");
*/
        }
      }
      build.$logLink = UrlHelpers.join("/workspaces", workspaceName, "projects", projectId, "jenkinsJob", jobName, "log", build.id);
      build.$viewLink = build.$logLink;

      angular.forEach(build.stages, (stage) => {
        enrichJenkinsStage(stage, build);
      });
    }
    return build;
  }

  export function enrichJenkinsStage(stage, build = null) {
    if (stage) {
      if (build) {
        stage.$buildId = build.id;
        stage.$project = build.$project;
      }
      var projectId = build.$project;
      var jobName = build.$jobId || projectId;
      var buildId = build.id;
      var workspaceName = Kubernetes.currentKubernetesNamespace();
      stage.$backgroundClass =  createBuildStatusBackgroundClass(stage.status);
      stage.$iconClass = createBuildStatusIconClass(stage.status);
      stage.$startTime = asDate(stage.startTime);
      if (!stage.duration) {
        stage.duration = 0;
      }
      var jenkinsUrl = jenkinsLink();
      if (jenkinsUrl) {
        var url = stage.url;
        if (url) {
          stage.$viewLink = UrlHelpers.join(jenkinsUrl, url);
          stage.$logLink = UrlHelpers.join(stage.$viewLink, "log");
          if (projectId && buildId) {
            stage.$logLink = UrlHelpers.join("/workspaces", workspaceName, "projects", projectId, "jenkinsJob", jobName, "log", buildId);
          }
        }
      }
    }
  }
}