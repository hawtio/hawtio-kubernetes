/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {
	var log = Logger.get('kubernetes-watcher');
	var apiUrl = UrlHelpers.join('api', 'v1');

	var namespaceType = WatchTypes.NAMESPACES;

	var k8sTypes = NamespacedTypes.k8sTypes;
  var osTypes  = NamespacedTypes.osTypes;

  var baseWatch = <any> {
			url: <string> undefined,
			connectTime: <Number> undefined,
			objects: <ObjectMap> {},
			objectArray: <Array<any>> [],
			customizers: <Array<(obj:any) => void>>[],
			onAddActions: <Array<(obj:any) => void>> [],
			onModifiedActions: <Array<(obj:any) => void>> [],
			onDeletedActions: <Array<(obj:any) => void>> [],
			socket: <WebSocket> undefined,
      connected: false
  }

	var namespaceWatch = <any> _.assign(_.cloneDeep(baseWatch), {
		selected: undefined,
		connectTime: <Number> undefined,
		url: UrlHelpers.join(apiUrl, WatchTypes.NAMESPACES),
	});

	var watches = <any> {};
	_.forEach(k8sTypes, (type) => {
		watches[type] = _.assign(_.cloneDeep(baseWatch), {
      prefix: kubernetesApiPrefix()
    });
  });
	_.forEach(osTypes, (type) => {
		watches[type] = _.assign(_.cloneDeep(baseWatch), {
      prefix: UrlHelpers.join(openshiftApiPrefix())
    });
  });

  hawtioPluginLoader.registerPreBootstrapTask((next) => {
    var uri = new URI(masterApiUrl());
    uri.path(namespaceWatch.url);
    var url = uri.toString();

    // can't use $http here
    $.get(uri.toString())
      .done((data) => {
        _.forEach(data.items, (namespace:any) => {
          if (!namespace.metadata.uid) {
            namespace.metadata.uid = namespace.metadata.namespace + '/' + namespace.metadata.name;
          }
          namespaceWatch.objects[namespace.metadata.uid] = namespace;
        });
        namespaceWatch.objectArray.length = 0;
        _.forIn(namespaceWatch.objects, (object, key) => {
          namespaceWatch.objectArray.push(object);
        });
      }).always(next);
  });

	function createWatch(type, watch, userDetails, $scope, onMessage = (event) => {}, onClose = (event) => {}, onOpen = (event) => {}) {
			var uri = new URI(masterApiUrl());
			uri.path(watch.url);
			if (uri.protocol() === "https") {
				uri.protocol('wss');
			} else {
				uri.protocol('ws');
			}
			uri.query(<any> {
				watch: true,
				access_token: userDetails.token
			});
			watch.retries = 0;
			var onOpenInternal = (event) => {
				watch.retries = 0;
				watch.connectTime = new Date().getTime();
        watch.connected = true;
				onOpen(event);
			};
			var onMessageInternal = (event) => {
				// log.debug(type, " onmessage: ", event);
				var data = angular.fromJson(event.data);
				//log.debug(type, " data: ", data);
				switch (data.type) {
					case WatchActions.ADDED:
					case WatchActions.MODIFIED:
						var obj = data.object;
						if (watch.customizers.length > 0) {
							_.forEach(watch.customizers, (customizer:(obj:any) => void) => {
								customizer(obj);
							});
						}
            if (!data.object.metadata.uid) {
              data.object.metadata.uid = data.object.metadata.namespace + '/' + data.object.metadata.name;
            }
						watch.objects[data.object.metadata.uid] = data.object;
						break;
					case WatchActions.DELETED:
						delete watch.objects[data.object.metadata.uid];
						break;
					default:
						log.info("Unknown event type: ", data.type);
						return;
				}
				watch.objectArray.length = 0;
				_.forIn(watch.objects, (object, uid) => {
					watch.objectArray.push(object);
				});
				onMessage(data);
				// execute any watch actions
				switch (data.type) {
					case WatchActions.ADDED:
						_.forEach(watch.onAddActions, (action:any) => action(data.object));
						break;
					case WatchActions.MODIFIED:
						_.forEach(watch.onModifiedActions, (action:any) => action(data.object));
						break;
					case WatchActions.DELETED:
						_.forEach(watch.onDeletedActions, (action:any) => action(data.object));
						break;
				}
				Core.$apply($scope);
			};
			var onCloseInternal = (event) => {
        watch.connected = false;
				if (watch.retries < 3 && watch.connectTime && new Date().getTime() - watch.connectTime > 5000) {
					setTimeout(() => {
						watch.retries = watch.retries + 1;
						log.debug("watch ", type, " disconnected, retry #", watch.retries);
						var ws = watch.socket = new WebSocket(uri.toString());
						ws.onopen = onOpenInternal;
						ws.onmessage = onMessageInternal;
						ws.onclose = onCloseInternal;
					}, 5000);
				} else {
					onClose(event);
				}
			}
			var ws = watch.socket = new WebSocket(uri.toString());
			ws.onopen = onOpenInternal;
			ws.onmessage = onMessageInternal;
			ws.onclose = onCloseInternal;
	}

	/*
	_module.run(['WatcherService', '$rootScope', (WatcherService:WatcherService, $rootScope) => {
		log.debug("Started watcher service");

//		Kubernetes.keepPollingModel = false;

		// some usage examples
//		WatcherService.addCustomizer('pods', (pod) => {
//			pod.SomeValue = 'foobar';
//		});
//		$rootScope.pods = WatcherService.getObjects('pods');
//		$rootScope.podMap = WatcherService.getObjectMap('pods');
//
//		$rootScope.$watchCollection('pods', (newValue) => {
//		  log.debug("pods changed: ", newValue);
//		});
//
//		$rootScope.$watch('podMap', (newValue) => {
//		  log.debug("pod map changed: ", newValue);
//		}, true);
	}]);
	*/

	_module.service('WatcherService', ['userDetails', '$rootScope', '$timeout', (userDetails, $rootScope, $timeout) => {
		var self = <any> {
			hasWebSocket: false
		};

		try {
			if (!WebSocket)  {
				return self;
			}
		} catch (err) {
			return self;
		}

		self.setNamespace = (namespace: string) => {
			if (namespace !== namespaceWatch.selected) {
				log.debug("Namespace changed, shutting down existing watches");
				_.forIn(watches, (watch, type) => {
					if (watch.socket) {
						watch.socket.close();
					}
				});
			  log.debug("Setting namespace watch to: ", namespace);
				namespaceWatch.selected = namespace;
        if (!namespace) {
          delete localStorage[Constants.NAMESPACE_STORAGE_KEY];
        } else {
          localStorage[Constants.NAMESPACE_STORAGE_KEY] = namespace;
        }
				if (namespace) {
          _.forIn(watches, (watch, type) => {
						// reset the object rather than re-assigning them
						// ensures that any watches in controllers won't
						// be watching a stale object
						watch.url = UrlHelpers.join(watch.prefix, WatchTypes.NAMESPACES, namespace, type);
						watch.connectTime = <Number> undefined;
						_.forEach(_.keys(watch.objects), (uid) => {
							_.forEach(watch.onDeletedActions, (action:any) => action(watch.objects[uid]));
							delete watch.objects[uid];
						});
						watch.objectArray.length = 0;
						watch.socket = <WebSocket> undefined;
          });
					_.forIn(watches, (watch, type) => {
						createWatch(type, watch, userDetails, $rootScope);
					});
				}
				$rootScope.$broadcast("WatcherNamespaceChanged", namespace);
			}
		}

		createWatch(WatchTypes.NAMESPACES, namespaceWatch, userDetails, $rootScope, (event) => {
			// log.debug("Got event: ", event);
			switch (event.type) {
				case WatchActions.ADDED:
				case WatchActions.MODIFIED:
          if (!namespaceWatch.selected) {
              self.setNamespace(event.object.metadata.name);
          }
					break;
				case WatchActions.DELETED:
					var next = <any> _.first(namespaceWatch.objectArray);
					if (next) {
						self.setNamespace(next.metadata.name);
					} else {
						self.setNamespace(undefined);
					}
					break;
				default:
					log.debug("Unknown namespace event type: ", event.type);
					return;
			}
		}, (event) => {
			log.debug("Namespace watch closed");
			self.setNamespace(undefined);
		});

    self.setNamespace(localStorage[Constants.NAMESPACE_STORAGE_KEY] || defaultNamespace);

		self.hasWebSocket = true;

		self.getNamespace = () => namespaceWatch.selected;

		self.addCustomizer = (type: string, customizer: (obj:any) => void) => {
			if (type in watches) {
				watches[type].customizers.push(customizer);
				_.forEach(watches[type].objectArray, (obj) => customizer(obj));
			}
		}

		self.getTypes = () => {
			return k8sTypes.concat([WatchTypes.NAMESPACES]).concat(osTypes);
		}

		self.getObjectMap = (type: string) => {
			if (type === WatchTypes.NAMESPACES) {
				return namespaceWatch.objects;
			}
			if (type in watches) {
				return watches[type].objects;
			} else {
				return undefined;
			}
		}

		self.getObjects = (type:string) => {
			if (type === WatchTypes.NAMESPACES) {
				return namespaceWatch.objectArray;
			}
			if (type in watches) {
				return watches[type].objectArray;
			} else {
				return undefined;
			}
		}

		self.listeners = <Array<(ObjectMap) => void>> [];

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

		var debouncedUpdate = _.debounce(updateFunction, 500, { trailing: true });

		// listener gets notified after a bunch of changes have occurred
		self.registerListener = (fn:(objects:ObjectMap) => void) => {
			self.listeners.push(fn);
			_.forEach(self.getTypes(), (type) => {
				self.addAction(type, WatchActions.ANY, debouncedUpdate)
			});
		}

		// function to watch individual actions on the k8s objects
		self.addAction = (type: string, action: string, fn: (obj:any) => void) => {
			var watch = <any> undefined;
			if (type === WatchTypes.NAMESPACES) {
				watch = namespaceWatch;
			} else {
				watch = watches[type];
			}
			if (watch) {
				switch (action) {
					case WatchActions.ANY:
						_.forEach(watch.objectArray, (obj) => fn(obj));
						watch.onAddActions.push(fn);
						watch.onDeletedActions.push(fn);
						watch.onModifiedActions.push(fn);
						break;
					case WatchActions.ADDED:
						_.forEach(watch.objectArray, (obj) => fn(obj));
						watch.onAddActions.push(fn);
						break;
					case WatchActions.MODIFIED:
						watch.onModifiedActions.push(fn);
						break;
					case WatchActions.DELETED:
						watch.onDeletedActions.push(fn);
						break;
					default:
						log.debug("Attempting to add unknown action: ", action);
				}
			}
		}
		return self;
	}]);
}
