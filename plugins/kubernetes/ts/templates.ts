/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {
  export var TemplateController = controller("TemplateController", [
    "$scope", "$location", "$http", "$timeout", "$routeParams", "marked", "$templateCache", "$modal", "KubernetesModel", "KubernetesState", "KubernetesApiURL", "$element",
    ($scope, $location, $http, $timeout, $routeParams, marked, $templateCache, $modal, KubernetesModel, KubernetesState, KubernetesApiURL, $element) => {

    var log = Logger.get('kubernetes-template-view');

    var states = $scope.states = {
      LISTING: 'LISTING',
      SELECTED: 'SELECTED',
      SUBSTITUTED: 'SUBSTITUTED',
      DEPLOYING: 'DEPLOYING'
    };

    $scope.currentState = states.LISTING;

    var model = $scope.model = KubernetesModel;

    var templates = $scope.templates = {};

    $scope.filterText = $location.search()["q"];
    $scope.targetNamespace = $routeParams.targetNamespace;
    initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    log.debug("$scope: ", $scope);
    log.debug("$routeParams: ", $routeParams);

    var workspace = $routeParams['workspace'];
    var project = $routeParams['project'];
    var namespace = $routeParams['namespace'];
    $scope.buildConfig = null;
    var watches = {};

    if (isOpenShift && workspace && project && namespace) {
      // we're in a workspace, let's fetch our buildConfig to find out all of our environments
      $scope.$watch('buildConfig', (buildConfig) => {
        if (!buildConfig) {
          return;
        }
        var envs = buildConfig.environments;
        if (!envs || envs.length === 0) {
          // clear out any existing watches
          _.forOwn(watches, (connection, ns) => {
            connection.disconnect();
            delete watches[ns];
          });
        }
        _.forEach(envs, (env) => {
          // we'll just use the model's list of templates
          if (env.namespace === namespace || env.namespace in watches) {
            return;
          }
          watches[env.namespace] = Kubernetes.watch($scope, $element, KubernetesAPI.WatchTypes.TEMPLATES, env.namespace, (_templates) => {
            templates[env.namespace] = _templates;
          });
        });
      });
      Kubernetes.watch($scope, $element, KubernetesAPI.WatchTypes.BUILD_CONFIGS, workspace, (buildConfigs) => {
        _.forEach(buildConfigs, (_buildConfig) => {
          var name = KubernetesAPI.getName(_buildConfig)
          if (name === project) {
            var sortedBuilds = null;
            Kubernetes.enrichBuildConfig(_buildConfig, sortedBuilds);
            $scope.buildConfig = _buildConfig;
          }
        });
      });
    }
    // we always show these
    $scope.$watchCollection('model.templates', (_templates) => {
      templates[namespace] = _templates;
    });

    $scope.$watchCollection('model.namespaces', (namespaces) => {
      if (!$scope.targetNamespace) {
        $scope.targetNamespace = model.currentNamespace();
      }
    });

    var returnTo = new URI($location.search()['returnTo'] || '/kubernetes/apps');

    $scope.toString = (obj) => {
      return toRawYaml(obj);
    }

    function goBack() {
      $location.path(returnTo.path()).search(returnTo.query(true));
    }

    // not currently used, but in case 'Done' should be
    // disabled while applying all the objects
    /*
    $scope.stillDeploying = () => {
      if (!$scope.outstanding) {
        return false;
      }
      var answer = false;
      _.forOwn($scope.outstanding, (value, key) => {
        if (!answer) {
          answer = value.applying;
        }
      });
      return answer;
    }
    */

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

    $scope.finish = () => {
      goBack();
    }

    $scope.cancel = () => {
      switch ($scope.currentState) {
        case states.SELECTED:
          delete $scope.formConfig;
          delete $scope.entity;
          delete $scope.selectedTemplate;
          $scope.objects = undefined;
          $scope.currentState = states.LISTING;
          return;
        case states.SUBSTITUTED:
          $scope.currentState = states.SELECTED;
          return;
        default:
          goBack();
          //$scope.currentState = states.LISTING;
      }
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

    $scope.selectTemplate = (template) => {
      $scope.selectedTemplate = _.clone(template);
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
        property.label = _.startCase(param.name);
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
      $scope.currentState = states.SELECTED;
      log.debug("Form config: ", formConfig);
    };

    function substitute(str, data) {
      return str.replace(/\${\w*}/g, (match) => {
        var key = match.replace(/\${/, '').replace(/}/, '').trim();
        return data[key] || match;
      });
    };

    $scope.substituteTemplate = () => {
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
      $scope.objects = objects;
      $scope.currentState = states.SUBSTITUTED;
    };

    $scope.deployTemplate = () => {
      var objects = $scope.objects;
      if ($scope.targetNamespace !== model.currentNamespace()) {
        $scope.$on('WatcherNamespaceChanged', () => {
          log.debug("Namespace changed");
          setTimeout(() => {
            applyObjects(objects);
            Core.$apply($scope);
          }, 500);
        });
        Core.notification('info', "Switching to namespace " + $scope.targetNamespace + " and deploying template");
        model.kubernetes.selectedNamespace = $scope.targetNamespace;
      } else {
        applyObjects(objects);
      }
    }

    function applyObjects(objects) {
      var outstanding = $scope.outstanding = <any> {};
      $scope.currentState = states.DEPLOYING;
      var projectClient = Kubernetes.createKubernetesClient("projects");

      _.forEach(objects, (object:any) => {
        log.debug("Object: ", object);

        var kind = getKind(object);
        var name = getName(object);
        var ns = getNamespace(object);

        var id = UrlHelpers.join(ns, kind, name);
        var result = outstanding[id] = <any> {
          applying: true,
          object: object
        };
        Core.$apply($scope);

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
              result.applying = false;
              result.succeeded = true;
              Core.$apply($scope);
            },
            (err) => {
              log.warn("Failed to update " + kind + " name: " + name + (ns ? " ns: " + ns: "") + " error: " + angular.toJson(err));
              result.applying = false;
              result.succeeded = false;
              result.error = jsyaml.dump(err);
              Core.$apply($scope);
            });
        }
      });
      //goBack();
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
  }]);
}

