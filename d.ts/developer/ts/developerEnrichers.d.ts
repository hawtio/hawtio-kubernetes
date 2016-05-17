/// <reference path="../../includes.d.ts" />
declare module Developer {
    function enrichWorkspaces(projects: any): any;
    function enrichWorkspace(project: any): any;
    function asDate(value: any): Date;
    function enrichJenkinsJobs(jobsData: any, projectId: any, jobName: any): any;
    function enrichJenkinsJob(job: any, projectId: any, jobName: any): any;
    function enrichJenkinsBuild(job: any, build: any, namespace?: string): any;
    function jenkinsLink(): any;
    function forgeReadyLink(): any;
    function enrichJenkinsPipelineJob(job: any, projectId: any, jobId: any): void;
    function enrichJenkinsStages(build: any, projectId: any, jobName: any): any;
    function enrichJenkinsStage(stage: any, build?: any): void;
}
