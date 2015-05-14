/// <reference path="schema.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
module Kubernetes {
  
  
  var hiddenProperties = ['status', 'deletionTimestamp'];

  function withProperty(schema:any, name:string, action:(any) => void) {
    if (schema.properties[name]) {
      action(schema.properties[name]);
    }
  }
  
  function hideProperties(schema) {
    _.forEach(hiddenProperties, (property) => {
      withProperty(schema, property, (property) => {
        property.hidden = true;
      })
    });
  }
  
  _module.factory('KubernetesSchema', ['SchemaRegistry', (schemas:HawtioForms.SchemaRegistry) => {
    configureSchema();
    
    schemas.addListener("k8s schema customizer", (name, schema) => {
      if (schema.properties) {
        if (schema.properties.name) {
          schema.controls = ['name', '*'];
        }
        withProperty(schema, 'portalIP', (property) => {
          property.label = "Portal IP"
        });
        withProperty(schema, 'publicIPs', (property) => {
          property.label = "Public IPs"
        });
        withProperty(schema, 'Spec', (property) => {
          property.label = 'false';
        });
        withProperty(schema, 'Metadata', (property) => {
          property.label = 'false';
        });
        hideProperties(schema);
      }
      
      if (_.endsWith(name, "ServiceSpec")) {
        schema.controls = ["portalIP", "createExternalLoadBalancer", "sessionAffinity", "publicIPs", "ports", "selector", "*"];
        withProperty(schema, 'sessionAffinity', (property) => {
          log.debug("Schema: ", schema);
          property.enum = ['None', 'ClientIP'];
          property.default = 'None';
        });
      }
      
      if (_.endsWith(name, "Service")) {
        schema.controls = undefined;
        schema.tabs = {
          'Basic Information': ['metadata'],
          'Details': ['*']
        }
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