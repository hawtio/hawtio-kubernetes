/// <reference path="../../includes.d.ts" />
declare module Developer {
    function enrichWorkspaces(projects: any): any;
    function enrichWorkspace(build: any): any;
    function enrichJenkinsJobs(jobsData: any, projectId: any): any;
    function enrichJenkinsJob(job: any, projectId: any): any;
    function createBuildStatusIconClass(result: any): string;
    function createBuildStatusBackgroundClass(result: any): string;
    function enrichJenkinsBuild(job: any, build: any): any;
    function jenkinsLink(): any;
    function enrichJenkinsPipelineJob(job: any): void;
    function enrichJenkinsStages(build: any): any;
    function enrichJenkinsStage(stage: any): void;
}
