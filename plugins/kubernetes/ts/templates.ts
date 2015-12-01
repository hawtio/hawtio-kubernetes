/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {
  export var TemplateController = controller("TemplateController", [
    "$scope", "$location", "$http", "$timeout", "$routeParams", "marked", "$templateCache", "$modal", "KubernetesModel", "KubernetesState", "KubernetesApiURL",
    ($scope, $location, $http, $timeout, $routeParams, marked, $templateCache, $modal, KubernetesModel, KubernetesState, KubernetesApiURL) => {
    var model = $scope.model = KubernetesModel;
    $scope.filterText = $location.search()["q"];

    // $scope.watch = watches[WatchTypes.TEMPLATES];

    $scope.targetNamespace = $routeParams.targetNamespace;
    initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    // reloadDataIfNoWatch();


    $scope.$watchCollection('model.namespaces', () => {
      if (!$scope.targetNamespace) {
        $scope.targetNamespace = model.currentNamespace();
      }
    });

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

    /*
    $scope.$watch('model.templates.length', (newValue) => {
      if (newValue === 0) {
        goBack();
      }
    });
    */

    $scope.filterTemplates = (template) => {
      if (Core.isBlank($scope.filterText)) {
        return true;
      }
      return _.contains(angular.toJson(template), $scope.filterText.toLowerCase());
    };

    $scope.openFullDescription = (template) => {
      var text = marked(getValueFor(template, 'description') || 'No description');
      var modal = $modal.open({
        templateUrl: UrlHelpers.join(templatePath, 'templateDescription.html'),
        controller: ['$scope', '$modalInstance', ($scope, $modalInstance) => {
          $scope.text = text,
          $scope.ok = () => {
            modal.close();
          }
        }]
      });
    };

    $scope.getDescription = (template) => {
      var answer:any = $(marked(getValueFor(template, 'description') || 'No description'));
      var textDefault = answer.html();
      var maxLength = 200;
      if (textDefault.length > maxLength) {
        var truncated = $.trim(textDefault).substring(0, maxLength).split(' ').slice(0, -1).join(' ');
        answer.html(truncated + '...');
        answer.append($templateCache.get('truncatedDescriptionTag.html'));
      }
      return answer.html();
    };

    $scope.getIconUrl = (template) => {
      return getValueFor(template, 'iconUrl') || defaultIconUrl;
    };

    $scope.deployTemplate = (template) => {
      log.debug("Template parameters: ", template.parameters);
      log.debug("Template objects: ", template.objects);
      log.debug("Template annotations: ", template.metadata.annotations);
      var templateAnnotations = template.metadata.annotations;
      if (templateAnnotations) {
        _.forEach(template.objects, (object:any) => {
          var annotations = object.metadata.annotations || {};
          var name = getName(object);
          var matches = _.filter(_.keys(templateAnnotations), (key) => key.match('.' + name + '/'));
          matches.forEach((match) => {
            if (!(match in annotations)) {
              annotations[match] = templateAnnotations[match];
            }
          });
          object.metadata.annotations = annotations;
        });
      }
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
      if ((!routeServiceName || !isOpenShift) && (!template.parameters || template.parameters.length === 0)) {
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
      if (routeServiceName && isOpenShift) {
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
    };

    function substitute(str, data) {
      return str.replace(/\${\w*}/g, (match) => {
        var key = match.replace(/\${/, '').replace(/}/, '').trim();
        return data[key] || match;
      });
    };

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
            };
            routes.push(route);
          }
        });
        objects = objects.concat(routes);
      }
      if ($scope.targetNamespace !== model.currentNamespace()) {
        $scope.$on('WatcherNamespaceChanged', () => {
          log.debug("Namespace changed");
          setTimeout(() => {
            // reloadDataIfNoWatch();
            applyObjects(objects);
            Core.$apply($scope);
          }, 500);
        });
        Core.notification('info', "Switching to namespace " + $scope.targetNamespace + " and deploying template");
        model.kubernetes.selectedNamespace = $scope.targetNamespace;
      } else {
        applyObjects(objects);
      }
    };

    function applyObjects(objects) {
      var projectClient = Kubernetes.createKubernetesClient("projects");

      _.forEach(objects, (object:any) => {
        log.debug("Object: ", object);

        var kind = getKind(object);
        var name = getName(object);
        var ns = getNamespace(object);

        if (kind && name) {
          if (ns && ns !== currentKubernetesNamespace()) {
            var project = {
              apiVersion: Kubernetes.defaultApiVersion,
              kind: "Project",
              metadata: {
                name: ns,
                labels: {
                }
              }
            };
            projectClient.put(project,
              (data) => {
                log.info("Created namespace: " + ns)
              },
              (err) => {
                log.warn("Failed to create namespace: " + ns + ": " + angular.toJson(err));
              });
          }

          var pluralKind = kind.toLowerCase() + "s";
          var kubeClient = Kubernetes.createKubernetesClient(pluralKind, ns);
          kubeClient.put(object,
            (data) => {
              log.info("updated " + kind + " name: " + name + (ns ? " ns: " + ns: ""));
            },
            (err) => {
              log.warn("Failed to update " + kind + " name: " + name + (ns ? " ns: " + ns: "") + " error: " + angular.toJson(err));
            });
        }
        //updateOrCreateObject(object, KubernetesModel);
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
    };

    /*
    function reloadDataIfNoWatch() {
      if (!$scope.watch || !$scope.watch.connected) {
        // TODO register a handler of bad watches so we invoke this in a polling form automatically?
        model.templatesResource.query((response) => {
          if (response) {
            var items = response.items;
            model.templates = items;
            Core.$apply($scope);
          }
        });
      }
    }
    */
  }]);
}

