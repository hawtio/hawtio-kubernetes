/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesInterfaces.ts"/>
module Kubernetes {

  export function schemaSetRequired(schema, propertyName, isRequired = true) {
    if (schema && propertyName) {
      var required = schema.required;
      if (isRequired) {
        if (!required) {
          required = [];
          schema.required = required;
        }
        if (!_.contains(required, propertyName)) {
          required.push(propertyName);
        }
      } else {
        if (required) {
          var idx = required.indexOf(propertyName);
          if (idx >= 0) {
            required.splice(idx, 1);
          }
        }
      }
    }
  }
}
