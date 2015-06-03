declare module Kubernetes {
    class consts {
        NAMESPACE_STORAGE_KEY: string;
    }
    var Constants: consts;
    interface ApiLocation {
        proto?: string;
        hostPort: string;
        prefix: string;
    }
    interface ApiLocations {
        openshift?: ApiLocation;
        k8s?: ApiLocation;
    }
    interface OAuthConfig {
        oauth_authorize_uri: string;
        oauth_client_id: string;
    }
    interface OpenshiftConfig {
        api?: ApiLocations;
        auth?: OAuthConfig;
    }
    class WatchTypes {
        static NAMESPACES: string;
        static ENDPOINTS: string;
        static PODS: string;
        static NODES: string;
        static REPLICATION_CONTROLLERS: string;
        static SERVICES: string;
        static TEMPLATES: string;
    }
    class WatchActions {
        static ANY: string;
        static ADDED: string;
        static MODIFIED: string;
        static DELETED: string;
    }
    interface ObjectMap {
        [uid: string]: any;
    }
    interface WatcherService {
        hasWebSocket: boolean;
        addCustomizer: (type: string, customizer: (obj: any) => void) => void;
        getTypes: () => Array<string>;
        getNamespace: () => string;
        setNamespace: (namespace: string) => void;
        getObjects: (type: string) => Array<any>;
        getObjectMap: (type: string) => ObjectMap;
        addAction: (type: string, action: string, fn: (obj: any) => void) => void;
        registerListener: (fn: (objects: ObjectMap) => void) => void;
    }
    interface KubePod {
        id: string;
        namespace: string;
    }
}
