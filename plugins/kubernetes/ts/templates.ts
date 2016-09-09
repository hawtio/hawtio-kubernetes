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

    $scope.subTabConfig = [];

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

    // Show templates on openshift, and configmaps on vanilla k8s
    if (isOpenShift) {
      $scope.$watchCollection('model.templates', (_templates) => {
        templates[namespace] = _templates;
      });
      // We currently store all of our templates in 'default', let's
      // have 'em available if the user is in a different namespace
      // TODO - maybe we want to look at the templates in the 'development' namespace too/instead?
      if (namespace !== 'default') {
        Kubernetes.watch($scope, $element, KubernetesAPI.WatchTypes.TEMPLATES, 'default', (_templates) => {
          templates['default'] = _templates;
          Core.$apply($scope);
        });
      }
    } else {
      function configmapsToTemplates(configmaps, templates) {
        if (!configmaps || !configmaps.length) {
          return;
        }
        var catalogs = _.filter(configmaps, (configmap:any) => getLabels(configmap).kind === 'catalog');
        catalogs.forEach((catalog:any) => {
          _.forOwn(catalog.data, (obj, key) => {
            if (_.endsWith(key, '.yml')) {
              var template = null;
              try {
                template = jsyaml.load(obj);
              } catch (e) {
                log.warn("Failed to load YAML from template " + key + " error: " + e);
              }
              if (template) {
                if (!template.kind || template.kind !== "Template") {
                  var name = Core.trimTrailing(key, ".yml");
                  if (_.startsWith(name, "catalog-")) {
                    name = Core.trimLeading(name, "catalog-");
                  }
                  var annotations = getAnnotations(catalog) || {};
                  var annotationsToCopy = ["description", "fabric8.io/iconUrl"];

                  // lets add any annotations from the first item just in case
                  angular.forEach(template.items, (item) => {
                    angular.forEach(annotationsToCopy, (annotationName) => {
                        var itemIcon = getAnnotation(item, annotationName);
                        if (itemIcon && !annotations[annotationName]) {
                          annotations[annotationName] = itemIcon;
                        }
                      });
                  });
                  template.metadata = {
                    name: name,
                    labels: getLabels(catalog),
                    annotations: annotations
                  }
                }
                templates.push(template);
              }
            } else if (_.endsWith(key, '.json')) {
              templates.push(angular.fromJson(obj));
            }
          });
        });
      }
      $scope.$watchCollection('model.configmaps', (configmaps) => {
        var _templates = [];
        log.debug("configmaps: ", configmaps);
        configmapsToTemplates(configmaps, _templates);
        templates[namespace] = _templates;
      });
      // We currently store all of our templates in 'default', let's
      // have 'em available if the user is in a different namespace
      // TODO - maybe we want to look at the templates in the 'development' namespace too/instead?
      if (namespace !== 'default') {
        Kubernetes.watch($scope, $element, KubernetesAPI.WatchTypes.CONFIG_MAPS, 'default', (configmaps) => {
          var _templates = [];
          log.debug("configmaps from default: ", configmaps);
          configmapsToTemplates(configmaps, _templates);
          templates['default'] = _templates;
          Core.$apply($scope);
        });
      }
    }

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
      goToPath($location, returnTo.path());
      $location.search(returnTo.query(true));
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

    $scope.totalTemplates = () => {
      var total = 0;
      _.forOwn(templates, (templates, namespace) => {
        total = total + templates.length;
      });
      return total;
    }

    $scope.finish = () => {
      goBack();
    }

    $scope.cancel = () => {
      function resetState() {
        delete $scope.formConfig;
        delete $scope.entity;
        delete $scope.selectedTemplate;
        $scope.objects = undefined;
      }
      switch ($scope.currentState) {
        case states.SELECTED:
          resetState();
          $scope.currentState = states.LISTING;
          return;
        case states.SUBSTITUTED:
          if (!$scope.selectedTemplate.parameters || !$scope.selectedTemplate.parameters.length) {
            resetState();
            $scope.currentState = states.LISTING;
          } else {
            $scope.currentState = states.SELECTED;
          }
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
      log.debug("Template objects: ", template.objects || template.items);
      var templateAnnotations = getAnnotations(template);
      log.debug("Template annotations: ", templateAnnotations);
      if (templateAnnotations) {
        _.forEach(template.objects || template.items, (object:any) => {
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
      var service = _.find(template.objects || template.items, (obj) => {
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
        // lets try find the annotated domain

        var domain = "vagrant.f8";
        var nsObject = $scope.model.getNamespaceOrProject(namespace);
        if (!nsObject) {
          log.warn("Could not find namespace object '" + namespace + "'");
        } else {
          var annotation = "fabric8.io/domain";
          var customDomain = getAnnotation(nsObject, annotation);
          if (customDomain) {
            domain = customDomain;
          } else {
            log.warn("The default namespace is not annotated with `" + annotation + "` to denote the default domain to use for Routes: " + angular.toJson(nsObject, true));
          }
        }
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
      // filter out any kinds that don't make sense for vanilla k8s
      if (!isOpenShift) {
        template.objects = _.filter(template.objects || template.items, (object:any) => {
          var kind = KubernetesAPI.toCollectionName(object.kind);
          switch (kind) {
            // We won't attempt to create these types
            case KubernetesAPI.WatchTypes.OAUTH_CLIENTS:
              return false;
            default:
              return true;
          }
        });
      }
      $scope.entity = <any> {};
      $scope.formConfig = formConfig;
      $scope.objects = template.objects || template.items;
      $scope.currentState = states.SELECTED;
      log.debug("Form config: ", formConfig);
      // If we've no form to show, transition to the next
      // state where we show the objects that will be deployed
      if ((!routeServiceName || !isOpenShift) && (!template.parameters || template.parameters.length === 0)) {
        log.debug("No parameters required, deploying objects");
        setTimeout(() => {
          $scope.substituteTemplate();
          Core.$apply($scope);
        }, 10);
        return;
      }
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
            var routeHostname = "";
            if (name && routeHostnameSuffix) {
              routeHostname = name + routeHostnameSuffix;
            }
            log.info("Creating route using " + routeHostname + " as routeHostnameSuffix = " + routeHostnameSuffix)
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
      // Sort the objects in the correct order so
      // everything deploys properly
      objects = sortObjects(objects);
      // remove any gack added to the objects by view directives
      $scope.objects = _.map(objects, (object:any) => {
        delete object.newGroup;
        delete object.$$hashKey;
        return object; 
      });
      $scope.currentState = states.SUBSTITUTED;
    };

    function sortObjects(objects) {
      return _.sortBy(objects, (obj:any, index, objects) => {
        var kind = KubernetesAPI.toCollectionName(obj.kind);
        switch (kind) {
          case KubernetesAPI.WatchTypes.SERVICE_ACCOUNTS:
            return 0;
          case KubernetesAPI.WatchTypes.SECRETS:
            return 1;
          case KubernetesAPI.WatchTypes.OAUTH_CLIENTS:
            return 2;
          case KubernetesAPI.WatchTypes.SERVICES:
            return 3;
          default:
            return 4;
        }
      });
    }

    $scope.deployTemplate = () => {
      var objects = $scope.objects;
      /*
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
      */
      Core.notification('info', "Deploying template to namespace: " + $scope.targetNamespace);
      setTimeout(() => {
        applyObjects(objects);
      }, 10);
        /*
      }
      */
    }

    function applyObjects(objects) {
      // create a unique enough ID for each object
      function createId(object) {
        var kind = getKind(object);
        var name = getName(object);
        var ns = $scope.targetNamespace;
        var id = UrlHelpers.join(ns, kind, name);
        return id;
      }
      // build up an array of results, strip out duplicates
      var outstanding = _.uniq(_.map(objects, (object:any) => {
        return {
          id: createId(object),
          kind: object.kind,
          applying: true,
          object: object
        };
      }), true, (obj, index) => {
        return createId(obj);
      });
      $scope.outstanding = outstanding;
      $scope.currentState = states.DEPLOYING;
      // update the view
      Core.$apply($scope);

      // shorthand
      function getOutstanding(id) {
        return _.find(outstanding, (obj) => obj.id === id);
      }

      // iterate through the objects to deploy and apply 'em in serial
      function deployObject(object, objects) {
        log.debug("Deploying object { kind:" + object.kind + ", name:" + object.metadata.name + " } remaining: ", objects.length);
        var kind = getKind(object);
        var name = getName(object);
        var ns = $scope.targetNamespace;
        var id = UrlHelpers.join(ns, kind, name);
        var result:any = getOutstanding(id);
        // put the next object if available
        function next() {
          while (objects.length > 0) {
            var object = objects.shift();
            if (object) {
              deployObject(object, objects);
            } else {
              log.debug("invalid object: ", object, " skipping");
            }
          }
        }
        if (!kind || !name) {
          log.debug("invalid object: ", object, " skipping");
          next();
          return;
        }
        KubernetesAPI.applyNamespace(object, ns);
        KubernetesAPI.put({
          object: object,
          success: (data) => {
            log.info("updated " + kind + " name: " + name + (ns ? " ns: " + ns: ""));
            result.applying = false;
            result.succeeded = true;
            Core.$apply($scope);
            next();
          },
          error: (err) => {
            log.warn("Failed to update " + kind + " name: " + name + (ns ? " ns: " + ns: "") + " error: " + angular.toJson(err));
            // this object's possibly already been deployed, let's just log it.
            if (!result.succeeded) {
              result.applying = false;
              result.succeeded = false;
              result.error = jsyaml.dump(err);
            }
            Core.$apply($scope);
            next();
          }
        });
      }
      deployObject(objects.shift(), objects);
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

