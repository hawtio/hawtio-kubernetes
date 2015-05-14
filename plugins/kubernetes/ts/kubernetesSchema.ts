/// <reference path="schema.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
module Kubernetes {
  
  
  var hiddenProperties = ['status', 'deletionTimestamp'];
  
  function hideProperties(schema) {
    _.forEach(hiddenProperties, (property) => {
      if (schema.properties[property]) {
        schema.properties[property].hidden = true;
      }
    });
  }
  
  _module.factory('KubernetesSchema', ['SchemaRegistry', (schemas:HawtioForms.SchemaRegistry) => {
    configureSchema();
    
    schemas.addListener("k8s schema customizer", (name, schema) => {
      if (schema.properties) {
        if (schema.properties.name) {
          schema.controls = ['name', '*'];
        }
        hideProperties(schema);
      }
      
      if (_.endsWith(name, "Service")) {
        log.debug("Name: ", name, " Schema: ", schema);
      }
     
    });
    
    
    schemas.addSchema('kubernetes', <any> schema);
    // now lets iterate and add all the definitions too
    angular.forEach(schema.definitions, (definition, typeName) => {
      //schemas.addSchema(typeName, definition);
      schemas.addSchema("#/definitions/" + typeName, definition);
    });
    return schema;
  }]);


  
}