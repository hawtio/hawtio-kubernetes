/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="kubernetesInterfaces.ts"/>

module Kubernetes {
	var log = Logger.get('kubernetes-watcher');
	var apiPrefix = '/kubernetes';
	var apiUrl = UrlHelpers.join(apiPrefix, 'api', 'v1beta3');
	
	var types = ['endpoints', 
	             'namespaces', 
							 'pods', 
							 'nodes', 
							 'replicationcontrollers', 
							 'services'];
							 
	var watches = <any> {};
	_.forEach(types, (type) => {
		watches[type] = {
			url: UrlHelpers.join(apiUrl, type),
			objects: <ObjectMap> {},
			objectArray: <Array<any>> [],
			customizers: <Array<(obj:any) => void>>[]
		}
	});
	
	_module.run(['WatcherService', '$rootScope', (WatcherService:WatcherService, $rootScope) => {
		log.debug("Started watcher service");
		
		/*
		// some usage examples
		WatcherService.addCustomizer('pods', (pod) => {
			pod.SomeValue = 'foobar';
		});
		$rootScope.pods = WatcherService.getObjects('pods');
		$rootScope.podMap = WatcherService.getObjectMap('pods');
		
		$rootScope.$watchCollection('pods', (newValue) => {
		  log.debug("pods changed: ", newValue);
		});
		
		$rootScope.$watch('podMap', (newValue) => {
		  log.debug("pod map changed: ", newValue);
		}, true);
		*/
	}]);
	
	_module.service('WatcherService', ['userDetails', '$rootScope', (userDetails, $rootScope) => {
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
		
		_.forIn(watches, (watch, type) => {
			var uri = new URI();
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
			
			var onOpen = (event) => {
				log.debug("Started watch on ", watch.url);
			}
			
			var onMessage = (event) => {
				// log.debug(type, " onmessage: ", event);
				var data = angular.fromJson(event.data);
				// log.debug(type, " data: ", data);
				switch (data.type) {
					case 'ADDED':
					case 'MODIFIED':
						var obj = data.object;
						if (watch.customizers.length > 0) {
							_.forEach(watch.customizers, (customizer:(obj:any) => void) => {
								customizer(obj);
							});
						}
						watch.objects[data.object.metadata.uid] = data.object;
						break;
					case 'DELETED':
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
				Core.$apply($rootScope);
			}
			
			var onClose = (event) => {
				log.debug("Stopped watching ", watch.url, " retrying");
				var ws = watch.ws = new WebSocket(uri.toString());
				ws.onopen = onOpen;
				ws.onmessage = onMessage;
				ws.onclose = onClose;
			}
			
			var ws = watch.ws = new WebSocket(uri.toString());
			ws.onopen = onOpen;
			ws.onmessage = onMessage;
			ws.onclose = onClose;
		});
		self.hasWebSocket = true;
		
		self.addCustomizer = (type: string, customizer: (obj:any) => void) => {
			if (type in watches) {
				watches[type].customizers.push(customizer);
			}
		}
		
		self.getObjectMap = (type: string) => {
			if (type in watches) {
				return watches[type].objects;
			} else {
				return undefined;
			}
		}
		
		self.getObjects = (type:string) => {
			if (type in watches) {
				return watches[type].objectArray;
			} else {
				return undefined;
			}
		}
		
		return self;
	}]);	
	
	
}