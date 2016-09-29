/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {
  var log = Logger.get('kubernetes-watcher');

  var k8sTypes = KubernetesAPI.NamespacedTypes.k8sTypes;
  var osTypes  = KubernetesAPI.NamespacedTypes.osTypes;

  var self = <any> {};

  // This fires whenever watches trigger
  var updateFunction = () => {
    log.debug("Objects changed, firing listeners");
    var objects = <ObjectMap>{};
    _.forEach(self.getTypes(), (type:string) => {
      objects[type] = self.getObjects(type);
    });
    if (isOpenShift) {
      objects[KubernetesAPI.WatchTypes.PROJECTS] = namespaceWatch.objects;
    }
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

  // If no kind is passed, returns true when all watchers have initialized
  // If a kind is passed, returns true if that watcher has fetched data
  self.fetched = (kind?:string) => {
    if (kind) {
      if (kind in namespaceWatch.watches) {
        return namespaceWatch.watches[kind]['fetched'] || false;
      } else {
        return false;
      }
    } else {
      var result = _.filter(<any>namespaceWatch.watches, {'fetched': false});
      if (!isOpenShift) {
        // On vanilla kubernetes, jenkinshift might not be running, let's avoid blocking the UI waiting to find out
        _.remove(result, (watch:any) => watch.config.kind === KubernetesAPI.WatchTypes.BUILD_CONFIGS);
      }
      if (result.length) {
        return false;
      } else {
        return true;
      }
    }
  }


  hawtioPluginLoader.registerPreBootstrapTask({
    name: 'KubernetesWatcherInit',
    depends: ['KubernetesApiDiscovery'],
    task: (next) => {
      var booted = false;
      var kind = getNamespaceKind();
      if (isOpenShift) {
        log.info("Backend is an Openshift instance, namespace kind: ", kind);
      } else {
        log.info("Backend is a vanilla Kubernetes instance, namespace kind: ", kind);
      }
      namespaceWatch.watch = KubernetesAPI.watch({
        kind: kind,
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
          if (!booted) {
            booted = true;
            next();
          }
        }
      });
    }
  });

  // figure out if we're running against openshift or vanilla k8s
  hawtioPluginLoader.registerPreBootstrapTask({
    name: 'KubernetesApiDiscovery',
    depends: ['KubernetesAPIProviderInit'],
    task: (next) => {
      isOpenShift = KubernetesAPI.isOpenShift;
      var userProfile = HawtioOAuth.getUserProfile();
      var provider = _.get(userProfile, 'provider');
      log.debug("User profile: ", userProfile + " provider: " + provider);
      if (provider === "hawtio-google-oauth") {
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
                  // nothing to do, overwrites any existing config
                }
              });
            }
            next();
          },
          beforeSend: (request) => {
            // nothing to do, overwrites any existing config
          }
        });
      } else {
        next();
      }
    }
  });

  var customUrlHandlers = {};

  function createWatch(kind, namespace) {
    if (kind === KubernetesAPI.WatchTypes.NAMESPACES || kind === KubernetesAPI.WatchTypes.PROJECTS) {
      return;
    }
    if (!namespaceWatch.watches[kind]) {
      log.debug("Creating watch for kind: ", kind);
      var watch:any = {
        fetched: false,
        config: <any> {
          kind: kind,
          namespace: KubernetesAPI.namespaced(kind) ? namespace : undefined,
          success: (objects) => {
            watch.objects = objects;
            if (!watch.fetched) {
              log.debug(kind, "fetched");
              watch.fetched = true;
            }
            debouncedUpdate();
          },
          error: (err) => {
            log.debug(kind, " fetch error: ", err);
            if (!watch.fetched) {
              watch.fetched = true;
            }
            debouncedUpdate();
          }
        }
      }
      if (kind in customUrlHandlers) {
        watch.config.urlFunction = customUrlHandlers[kind];
      }
      watch = _.extend(watch, KubernetesAPI.watch(watch.config));
      namespaceWatch.watches[kind] = watch;
    }
  }

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
        createWatch(kind, namespace);
      });
    }
  };

  self.hasWebSocket = true;

  self.getNamespace = () => namespaceWatch.selected;

  self.registerCustomUrlFunction = (kind:string, url:(options:KubernetesAPI.K8SOptions) => string) => {
    customUrlHandlers[kind] = url;
    if (kind in namespaceWatch.watches) {
      log.debug("Custom URL function set for", kind, "restarting watch");
      // reset the existing watch;
      namespaceWatch.watches[kind].disconnect();
      delete namespaceWatch.watches[kind];
      createWatch(kind, namespaceWatch.selected);
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
        // TODO we get the list of nodes from deployed pods
        // but let's not start this watch for now as it 
        // requires cluster_admin
        case KubernetesAPI.WatchTypes.NODES:
          return false;

/*
        // TODO remove these if supported in openshift
        case KubernetesAPI.WatchTypes.REPLICA_SETS:
        case KubernetesAPI.WatchTypes.DEPLOYMENTS:
          if (isOpenShift) {
            return false;
          } else {
            return true;
          }

*/
        default:
          return true;
      }
    }
    var answer = k8sTypes.concat([WatchTypes.NAMESPACES]);
    if (isOpenShift) {
      answer = answer.concat(osTypes);
    } else {
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

  _module.service('WatcherService', ['userDetails', '$rootScope', '$timeout', (userDetails, $rootScope, $timeout) => {
    return self;
  }]);
}
