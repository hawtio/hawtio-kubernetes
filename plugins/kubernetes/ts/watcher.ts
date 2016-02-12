/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {
  var log = Logger.get('kubernetes-watcher');

  var k8sTypes = KubernetesAPI.NamespacedTypes.k8sTypes;
  var osTypes  = KubernetesAPI.NamespacedTypes.osTypes;

  var self = <any> {};

  var updateFunction = () => {
    
    log.debug("Objects changed, firing listeners");
    var objects = <ObjectMap>{};
    _.forEach(self.getTypes(), (type:string) => {
      objects[type] = self.getObjects(type);
    });
    _.forEach(self.listeners, (listener:(ObjectMap) => void) => {
      listener(objects);
    });
  };
  var debouncedUpdate = _.debounce(updateFunction, 75, { trailing: true });

  var namespaceWatch = {
    selected: undefined,
    watch: undefined,
    objects: [],
    objectMap: {},
    watches: {}
  };

  hawtioPluginLoader.registerPreBootstrapTask({
    name: 'KubernetesWatcherInit',
    depends: ['KubernetesApiDiscovery'],
    task: (next) => {
      var booted = false;
      if (isOpenShift) {
        log.info("Backend is an Openshift instance");
      } else {
        log.info("Backend is a vanilla Kubernetes instance");
      }
      namespaceWatch.watch = KubernetesAPI.watch({
        kind: KubernetesAPI.WatchTypes.NAMESPACES,
        success: (objects) => {
          namespaceWatch.objects = objects;
          if (!booted) {
            booted = true;
            self.setNamespace(localStorage[Constants.NAMESPACE_STORAGE_KEY] || defaultNamespace);
            next();
          }
          log.debug("Got namespaces: ", namespaceWatch.objects);
        }, error: (error:any) => {
          log.warn("Error fetching namespaces: ", error);
          // TODO is this necessary?
          //HawtioOAuth.doLogout();
          if (!booted) {
            booted = true;
            next();
          }
        }
      });
    }
  });

  hawtioPluginLoader.registerPreBootstrapTask({
    name: 'KubernetesApiDiscovery',
    depends: ['hawtio-oauth'],
    task: (next) => {
      isOpenShift = false;

      var userProfile = HawtioOAuth.getUserProfile();
      log.debug("User profile: ", userProfile);
      if (userProfile && userProfile.provider === "hawtio-google-oauth") {
        log.debug("Possibly running on GCE");
        // api master is on GCE
        $.ajax({
          url: UrlHelpers.join(masterApiUrl(), 'api', 'v1', 'namespaces'),
          complete: (jqXHR, textStatus) => {
            if (textStatus === "success") {
              log.debug("jqXHR: ", jqXHR);
              userProfile.oldToken = userProfile.token;
              userProfile.token = undefined;
              $.ajaxSetup({
                beforeSend: (request) => {

                }
              });
            }
            next();
          },
          beforeSend: (request) => {

          }
        });
      } else {
        log.debug("Not running on GCE");
        // double-check if we're on vanilla k8s or openshift
        var rootUri = new URI(masterApiUrl()).path("/oapi").query("").toString();
        log.debug("Checking for an openshift backend");
        HawtioOAuth.authenticatedHttpRequest({
          url: rootUri,
          success: (data) => {
            if (data) {
              isOpenShift = true;
            }
            next();
          },
          error: (jqXHR, textStatus, errorThrown) => {
            var error = KubernetesAPI.getErrorObject(jqXHR);
            if (!error) {
              log.debug("Failed to find root paths: ", textStatus, ": ", errorThrown);
            } else {
              log.debug("Failed to find root paths: ", error);
            }
            isOpenShift = false;
            next();
          }
        });
      }
    }
  });

  var customUrlHandlers = {};

  self.setNamespace = (namespace: string) => {
    if (namespace === namespaceWatch.selected) {
      return;
    }
    if (namespaceWatch.selected) {
      log.debug("Stopping current watches");
      _.forOwn(namespaceWatch.watches, (watch, key) => {
        if (!KubernetesAPI.namespaced(key)) {
          return;
        }
        log.debug("Disconnecting watch: ", key);
        watch.disconnect();
      });
      _.forEach(_.keys(namespaceWatch.watches), (key) => {
        if (!KubernetesAPI.namespaced(key)) {
          return;
        }
        log.debug("Deleting kind: ", key);
        delete namespaceWatch.watches[key];
      });
    }
    namespaceWatch.selected = namespace;
    if (namespace) {
      _.forEach(self.getTypes(), (kind:string) => {
        if (kind === KubernetesAPI.WatchTypes.NAMESPACES) {
          return;
        }
        if (!namespaceWatch.watches[kind]) {
          log.debug("Creating watch for kind: ", kind);
          var config = <any> {
            kind: kind,
            namespace: KubernetesAPI.namespaced(kind) ? namespace : undefined,
            success: (objects) => {
              watch.objects = objects;
              debouncedUpdate();
            }
          };
          if (kind in customUrlHandlers) {
            config.urlFunction = customUrlHandlers[kind];
          }
          var watch = <any> KubernetesAPI.watch(config);
          watch.config = config;
          namespaceWatch.watches[kind] = watch;
        }
      });
    }
  };

  self.hasWebSocket = true;

  self.getNamespace = () => namespaceWatch.selected;

  self.registerCustomUrlFunction = (kind:string, url:(options:KubernetesAPI.K8SOptions) => string) => {
    customUrlHandlers[kind] = url;
    if (kind in namespaceWatch.watches) {
      var watch = namespaceWatch.watches[kind];
      var config = watch.config;
      config.urlFunction = url;
      watch.disconnect();
      delete namespaceWatch.watches[kind];
      watch = <any> KubernetesAPI.watch(config);
      namespaceWatch.watches[kind] = watch;
    }
  }

  self.getTypes = () => {
    var filter = (kind:string) => {
      // filter out stuff we don't care about yet
      switch(kind) {
        case KubernetesAPI.WatchTypes.OAUTH_CLIENTS:
        case KubernetesAPI.WatchTypes.IMAGE_STREAMS:
        case KubernetesAPI.WatchTypes.POLICIES:
        case KubernetesAPI.WatchTypes.ROLES:
        case KubernetesAPI.WatchTypes.ROLE_BINDINGS:
        case KubernetesAPI.WatchTypes.POLICY_BINDINGS:
        case KubernetesAPI.WatchTypes.PERSISTENT_VOLUME_CLAIMS:
        case KubernetesAPI.WatchTypes.PERSISTENT_VOLUMES:
        case KubernetesAPI.WatchTypes.ENDPOINTS:
        case KubernetesAPI.WatchTypes.RESOURCE_QUOTAS:
        case KubernetesAPI.WatchTypes.SERVICE_ACCOUNTS:
          return false;

        default:
          return true;
      }
    }
    var answer = k8sTypes.concat([WatchTypes.NAMESPACES]);
    if (isOpenShift) {
      answer = answer.concat(osTypes);
    } else {
      answer = answer.concat(KubernetesAPI.WatchTypes.TEMPLATES);
      answer = answer.concat(KubernetesAPI.WatchTypes.BUILD_CONFIGS);
    }
    return _.filter(answer, filter);
  }

  self.getObjects = (kind: string) => {
    if (kind === WatchTypes.NAMESPACES) {
      return namespaceWatch.objects;
    }
    if (kind in namespaceWatch.watches) {
      return namespaceWatch.watches[kind].objects;
    } else {
      return undefined;
    }
  }

  self.listeners = <Array<(ObjectMap) => void>> [];

  // listener gets notified after a bunch of changes have occurred
  self.registerListener = (fn:(objects:ObjectMap) => void) => {
    self.listeners.push(fn);
  }

  var projectsHandle = <any> undefined;

  // kick off the project watcher a bit sooner also
  hawtioPluginLoader.registerPreBootstrapTask({
    name: 'ProjectsWatcher',
    depends: ['KubernetesApiDiscovery'],
    task: (next) => {
      if (isOpenShift) {
        projectsHandle = KubernetesAPI.watch({
          kind: KubernetesAPI.WatchTypes.PROJECTS,
          namespace: undefined,
          success: (objects) => {
            if (self.listeners && self.listeners.length) {
              log.debug("got projects: ", objects);
              _.forEach(self.listeners, (listener:(objects:ObjectMap) => void) => {
                listener({
                  projects: objects
                });
              });
            }
          }
        });
      }
      next();
    }
  });


_module.service('WatcherService', ['userDetails', '$rootScope', '$timeout', (userDetails, $rootScope, $timeout) => {
    return self;
}]);
}
