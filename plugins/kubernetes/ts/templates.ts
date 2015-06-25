/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {
  export var TemplateController = controller("TemplateController", ["$scope", "KubernetesModel", "$location", "marked", ($scope, KubernetesModel, $location, marked) => {
    $scope.model = KubernetesModel;
    $scope.filterText = "";

    var returnTo = new URI($location.search()['returnTo'] || '/kubernetes/apps');

    function goBack() {
      $location.path(returnTo.path()).search(returnTo.query(true));
    }

    function getAnnotations(obj) {
      return Core.pathGet(obj, ['metadata', 'annotations']);
    }

    function getValueFor(obj, key) {
      var annotations = getAnnotations(obj);
      if (!annotations) {
        return "";
      }
      var name = getName(obj);
      if (name) {
        var fullKey = "fabric8." + name + "/" + key;
        var answer = annotations[fullKey];
        if (answer) {
          return answer;
        }
      }
      var key: any = _.find(_.keys(annotations), (k: string) => _.endsWith(k, key));
      if (key) {
        return annotations[key];
      } else {
        return "";
      }
    }

    $scope.cancel = () => {
      if ($scope.formConfig) {
        delete $scope.formConfig;
        delete $scope.entity;
        $scope.objects = undefined;
        return;
      }
      goBack();
    }

    $scope.$watch('model.templates.length', (newValue) => {
      if (newValue === 0) {
        goBack();
      }
    });

    $scope.filterTemplates = (template) => {
      if (Core.isBlank($scope.filterText)) {
        return true;
      }
      return _.contains(angular.toJson(template), $scope.filterText.toLowerCase());
    }

    $scope.getDescription = (template) => {
      return marked(getValueFor(template, 'description') || 'No description');
    }

    $scope.getIconUrl = (template) => {
      return getValueFor(template, 'iconUrl') || defaultIconUrl;
    }


    $scope.deployTemplate = (template) => {
      log.debug("Template parameters: ", template.parameters);
      log.debug("Template objects: ", template.objects);
      var routeServiceName = <string> undefined;
      var service = _.find(template.objects, (obj) => {
        if (getKind(obj) === "Service") {
          var ports = getPorts(obj);
          if (ports && ports.length === 1) {
            return true;
          }
        } else {
          return false;
        }
      });
      if (service) {
        routeServiceName = getName(service);
      }
      log.debug("Service: ", service);
      if (!routeServiceName && (!template.parameters || template.parameters.length === 0)) {
        log.debug("No parameters required, deploying objects");
        applyObjects(template.objects);
        return;
      }
      var formConfig = {
        style: HawtioForms.FormStyle.STANDARD,
        hideLegend: true,
        properties: <any> {}
      };
      var params = template.parameters;
      _.forEach(params, (param:any) => {
        var property = <any> {};
        property.label = param.name.titleize();
        property.description = param.description;
        property.default = param.value;
        // TODO, do parameters support types?
        property.type = 'string';
        formConfig.properties[param.name] = property;
      });
      if (routeServiceName) {
        formConfig.properties.createRoute = {
          type: 'boolean',
          default: true,
          label: "Create Route"
        };
/*
        formConfig.properties.routeName = {
          type: 'string',
          label: 'Route Name',
          default: routeServiceName,
          'control-group-attributes': {
            'ng-show': 'entity.createRoute'
          }
        };
*/
        formConfig.properties.routeServiceName = {
          type: 'hidden',
          default: routeServiceName
        }

        var namespace = currentKubernetesNamespace();
        // TODO store this in localStorage!
        var domain = "vagrant.f8";
        var defaultRouteHostSuffix = '.' + (namespace === "default" ? "" : namespace + ".") + domain;
        formConfig.properties.routeHostname = {
          type: 'string',
          default: defaultRouteHostSuffix,
          label: "Route host name suffix",
          'control-group-attributes': {
            'ng-show': 'entity.createRoute'
          }
        };
      }
      $scope.entity = <any> {};
      $scope.formConfig = formConfig;
      $scope.objects = template.objects;
      log.debug("Form config: ", formConfig);
    }

    function substitute(str, data) {
      return str.replace(/\${\w*}/g, (match) => {
        var key = match.replace(/\${/, '').replace(/}/, '').trim();
        return data[key] || match;
      });
    }

    $scope.substituteAndDeployTemplate = () => {
      var objects = $scope.objects;
      var objectsText = angular.toJson(objects, true);
      // pull these out of the entity object so they're not used in substitutions
      var createRoute = $scope.entity.createRoute;
      var routeHostnameSuffix = $scope.entity.routeHostname || "";
      var routeName = $scope.entity.routeName;
      var routeServiceName = $scope.entity.routeServiceName;
      delete $scope.entity.createRoute;
      delete $scope.entity.routeHostname;
      delete $scope.entity.routeName;
      delete $scope.entity.routeServiceName;
      objectsText = substitute(objectsText, $scope.entity);
      objects = angular.fromJson(objectsText);
      if (createRoute) {
        var routes = [];
        angular.forEach(objects, (object) => {
          var kind = object.kind;
          var name = getName(object);
          if (name && "Service" === kind) {
            var routeHostname = name + routeHostnameSuffix;
            var route = {
              kind: "Route",
              apiVersion: defaultOSApiVersion,
              metadata: {
                name: name,
              },
              spec: {
                host: routeHostname,
                to: {
                  kind: "Service",
                  name: name
                }
              }
            }
            routes.push(route);
          }
        });
        objects = objects.concat(routes);
      }
      applyObjects(objects);
    }

    function applyObjects(objects) {
      _.forEach(objects, (object:any) => {
        log.debug("Object: ", object);
        updateOrCreateObject(object, KubernetesModel);
      });
      goBack();
    }

    $scope.deleteTemplate = (template) => {
      UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
        collection: [template],
        index: 'metadata.name',
        onClose: (result:boolean) => {
          if (result) {
            KubernetesModel['templatesResource'].delete({
              id: template.metadata.name
            }, undefined, () => {
              KubernetesModel['templatesResource'].query((data) => {
                KubernetesModel.templates = data.items;
              });
            }, (error) => {
              log.debug("Error deleting template: ", error); 
            });
          }
        },
        title: 'Delete Template?',
        action: 'The following template will be deleted:',
        okText: 'Delete',
        okClass: 'btn-danger',
        custom: "This operation is permanent once completed!",
        customClass: "alert alert-warning"
      }).open();
    }

  }]);
}

