module Kubernetes {
	
	export interface ObjectMap {
		[uid:string]: any;		
	}
	
	export interface WatcherService {
		hasWebSocket: boolean;
		addCustomizer: (type: string, customizer: (obj:any) => void) => void;
		getNamespaces: () => Array<string>;
		getNamespace: () => string;
		setNamespace: (namespace: string) => void;
		getObjects: (type: string) => Array<any>;
		getObjectMap: (type: string) => ObjectMap;
	}
	
}