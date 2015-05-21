module Kubernetes {
	
  export interface ApiLocation {
    proto?:string;
    hostPort:string;
    prefix:string;
  }
  
  export interface ApiLocations {
    openshift?: ApiLocation;
    k8s?: ApiLocation;
  }
  
  export interface OAuthConfig {
    oauth_authorize_uri:string;
    oauth_client_id:string;
  }
  
  export interface OpenshiftConfig {
    api?: ApiLocations;
    auth?: OAuthConfig;
  }

	export class WatchTypes {
		public static get NAMESPACES():string { return "namespaces"; }
		public static get ENDPOINTS():string { return "endpoints"; }
		public static get PODS():string { return "pods"; }
		public static get NODES():string { return "nodes"; }
		public static get REPLICATION_CONTROLLERS():string { return "replicationcontrollers"; }
		public static get SERVICES():string { return "services"; }
	}
	
	export class WatchActions {
		public static get ANY():string { return "*"; }
		public static get ADDED():string { return "ADDED"; }
		public static get MODIFIED():string { return "MODIFIED"; }
		public static get DELETED():string { return "DELETED"; }
	}
	
	export interface ObjectMap {
		[uid:string]: any;		
	}
	
	export interface WatcherService {
		hasWebSocket: boolean;
		addCustomizer: (type: string, customizer: (obj:any) => void) => void;
		getTypes: () => Array<string>;
		getNamespace: () => string;
		setNamespace: (namespace: string) => void;
		getObjects: (type: string) => Array<any>;
		getObjectMap: (type: string) => ObjectMap;
		addAction: (type: string, action: string, fn: (obj:any) => void) => void;
		registerListener: (fn:(objects:ObjectMap) => void) => void;
	}
	
}