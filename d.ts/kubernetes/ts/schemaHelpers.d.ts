/// <reference path="../../includes.d.ts" />
/// <reference path="kubernetesInterfaces.d.ts" />
declare module Kubernetes {
    function schemaSetRequired(schema: any, propertyName: any, isRequired?: boolean): void;
}
