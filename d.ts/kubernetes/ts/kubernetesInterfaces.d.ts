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
    interface KubernetesConfig {
        master_uri?: string;
        api?: ApiLocations;
        openshift?: OpenShiftOAuthConfig;
        google?: GoogleOAuthConfig;
        keycloak?: KeyCloakAuthConfig;
    }
    interface OpenShiftOAuthConfig {
        oauth_authorize_uri: string;
        oauth_client_id: string;
    }
    interface GoogleOAuthConfig {
        authenticationURI: string;
        authorizationURI: string;
        clientId: string;
        clientSecret: string;
        redirectURI: string;
        scope: string;
        tokenURI?: string;
    }
    interface KeyCloakAuthConfig {
        oauth_authorize_uri: string;
        oauth_client_id: string;
    }
    interface KubernetesState {
        namespaces: Array<string>;
        selectedNamespace: string;
    }
    class WatchTypes {
        static NAMESPACES: string;
        static ENDPOINTS: string;
        static PODS: string;
        static REPLICATION_CONTROLLERS: string;
        static SERVICES: string;
        static TEMPLATES: string;
        static ROUTES: string;
        static BUILD_CONFIGS: string;
        static BUILDS: string;
        static DEPLOYMENT_CONFIGS: string;
        static IMAGE_STREAMS: string;
        static POLICIES: string;
        static POLICY_BINDINGS: string;
        static ROLE_BINDINGS: string;
        static ROLES: string;
    }
    class NamespacedTypes {
        static k8sTypes: Array<string>;
        static osTypes: Array<string>;
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
