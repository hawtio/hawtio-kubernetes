/// <reference path="../../includes.d.ts" />
declare module Kubernetes {
    var schema: {
        "id": string;
        "$schema": string;
        "definitions": {
            "api_RootPaths": {
                "type": string;
                "description": string;
                "properties": {
                    "paths": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_AWSElasticBlockStoreVolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "fsType": {
                        "type": string;
                        "description": string;
                    };
                    "partition": {
                        "type": string;
                        "description": string;
                    };
                    "readOnly": {
                        "type": string;
                        "description": string;
                    };
                    "volumeID": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_Capabilities": {
                "type": string;
                "description": string;
                "properties": {
                    "add": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "drop": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_CephFSVolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "monitors": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "readOnly": {
                        "type": string;
                        "description": string;
                    };
                    "secretFile": {
                        "type": string;
                        "description": string;
                    };
                    "secretRef": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "user": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_Container": {
                "type": string;
                "description": string;
                "properties": {
                    "args": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "command": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "env": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "image": {
                        "type": string;
                        "description": string;
                    };
                    "imagePullPolicy": {
                        "type": string;
                        "description": string;
                    };
                    "lifecycle": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "livenessProbe": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                        "maxLength": number;
                        "pattern": string;
                    };
                    "ports": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "readinessProbe": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "resources": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "securityContext": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "stdin": {
                        "type": string;
                        "description": string;
                    };
                    "terminationMessagePath": {
                        "type": string;
                        "description": string;
                    };
                    "tty": {
                        "type": string;
                        "description": string;
                    };
                    "volumeMounts": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "workingDir": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ContainerPort": {
                "type": string;
                "description": string;
                "properties": {
                    "containerPort": {
                        "type": string;
                        "description": string;
                    };
                    "hostIP": {
                        "type": string;
                        "description": string;
                    };
                    "hostPort": {
                        "type": string;
                        "description": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                    };
                    "protocol": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ContainerState": {
                "type": string;
                "description": string;
                "properties": {
                    "running": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "terminated": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "waiting": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ContainerStateRunning": {
                "type": string;
                "description": string;
                "properties": {
                    "startedAt": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ContainerStateTerminated": {
                "type": string;
                "description": string;
                "properties": {
                    "containerID": {
                        "type": string;
                        "description": string;
                    };
                    "exitCode": {
                        "type": string;
                        "description": string;
                    };
                    "finishedAt": {
                        "type": string;
                        "description": string;
                    };
                    "message": {
                        "type": string;
                        "description": string;
                    };
                    "reason": {
                        "type": string;
                        "description": string;
                    };
                    "signal": {
                        "type": string;
                        "description": string;
                    };
                    "startedAt": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ContainerStateWaiting": {
                "type": string;
                "description": string;
                "properties": {
                    "reason": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ContainerStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "containerID": {
                        "type": string;
                        "description": string;
                    };
                    "image": {
                        "type": string;
                        "description": string;
                    };
                    "imageID": {
                        "type": string;
                        "description": string;
                    };
                    "lastState": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                        "maxLength": number;
                        "pattern": string;
                    };
                    "ready": {
                        "type": string;
                        "description": string;
                    };
                    "restartCount": {
                        "type": string;
                        "description": string;
                    };
                    "state": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_EmptyDirVolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "medium": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_EndpointAddress": {
                "type": string;
                "description": string;
                "properties": {
                    "ip": {
                        "type": string;
                        "description": string;
                    };
                    "targetRef": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_EndpointPort": {
                "type": string;
                "description": string;
                "properties": {
                    "name": {
                        "type": string;
                        "description": string;
                        "maxLength": number;
                        "pattern": string;
                    };
                    "port": {
                        "type": string;
                        "description": string;
                    };
                    "protocol": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_EndpointSubset": {
                "type": string;
                "description": string;
                "properties": {
                    "addresses": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "ports": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_Endpoints": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "subsets": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_EndpointsList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_EnvVar": {
                "type": string;
                "description": string;
                "properties": {
                    "name": {
                        "type": string;
                        "description": string;
                        "pattern": string;
                    };
                    "value": {
                        "type": string;
                        "description": string;
                    };
                    "valueFrom": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_EnvVarSource": {
                "type": string;
                "description": string;
                "properties": {
                    "fieldRef": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_Event": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "count": {
                        "type": string;
                        "description": string;
                    };
                    "firstTimestamp": {
                        "type": string;
                        "description": string;
                    };
                    "involvedObject": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "lastTimestamp": {
                        "type": string;
                        "description": string;
                    };
                    "message": {
                        "type": string;
                        "description": string;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "reason": {
                        "type": string;
                        "description": string;
                    };
                    "source": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_EventList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_EventSource": {
                "type": string;
                "description": string;
                "properties": {
                    "component": {
                        "type": string;
                        "description": string;
                    };
                    "host": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ExecAction": {
                "type": string;
                "description": string;
                "properties": {
                    "command": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_GCEPersistentDiskVolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "fsType": {
                        "type": string;
                        "description": string;
                    };
                    "partition": {
                        "type": string;
                        "description": string;
                    };
                    "pdName": {
                        "type": string;
                        "description": string;
                    };
                    "readOnly": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_GitRepoVolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "repository": {
                        "type": string;
                        "description": string;
                    };
                    "revision": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_GlusterfsVolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "endpoints": {
                        "type": string;
                        "description": string;
                    };
                    "path": {
                        "type": string;
                        "description": string;
                    };
                    "readOnly": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_HTTPGetAction": {
                "type": string;
                "description": string;
                "properties": {
                    "host": {
                        "type": string;
                        "description": string;
                    };
                    "path": {
                        "type": string;
                        "description": string;
                    };
                    "port": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "scheme": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_Handler": {
                "type": string;
                "description": string;
                "properties": {
                    "exec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "httpGet": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "tcpSocket": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_HostPathVolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "path": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ISCSIVolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "fsType": {
                        "type": string;
                        "description": string;
                    };
                    "iqn": {
                        "type": string;
                        "description": string;
                    };
                    "lun": {
                        "type": string;
                        "description": string;
                    };
                    "readOnly": {
                        "type": string;
                        "description": string;
                    };
                    "targetPortal": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_Lifecycle": {
                "type": string;
                "description": string;
                "properties": {
                    "postStart": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "preStop": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_List": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_ListMeta": {
                "type": string;
                "description": string;
                "properties": {
                    "resourceVersion": {
                        "type": string;
                        "description": string;
                    };
                    "selfLink": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_LoadBalancerIngress": {
                "type": string;
                "description": string;
                "properties": {
                    "hostname": {
                        "type": string;
                        "description": string;
                    };
                    "ip": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_LoadBalancerStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "ingress": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_LocalObjectReference": {
                "type": string;
                "description": string;
                "properties": {
                    "name": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_MetadataFile": {
                "type": string;
                "description": string;
                "properties": {
                    "fieldRef": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_MetadataVolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_NFSVolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "path": {
                        "type": string;
                        "description": string;
                    };
                    "readOnly": {
                        "type": string;
                        "description": string;
                    };
                    "server": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_Namespace": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_NamespaceList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_NamespaceSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "finalizers": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_NamespaceStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "phase": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_Node": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_NodeAddress": {
                "type": string;
                "description": string;
                "properties": {
                    "address": {
                        "type": string;
                        "description": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_NodeCondition": {
                "type": string;
                "description": string;
                "properties": {
                    "lastHeartbeatTime": {
                        "type": string;
                        "description": string;
                    };
                    "lastTransitionTime": {
                        "type": string;
                        "description": string;
                    };
                    "message": {
                        "type": string;
                        "description": string;
                    };
                    "reason": {
                        "type": string;
                        "description": string;
                    };
                    "status": {
                        "type": string;
                        "description": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_NodeList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_NodeSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "externalID": {
                        "type": string;
                        "description": string;
                    };
                    "podCIDR": {
                        "type": string;
                        "description": string;
                    };
                    "providerID": {
                        "type": string;
                        "description": string;
                    };
                    "unschedulable": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_NodeStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "addresses": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "capacity": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "javaType": string;
                    };
                    "conditions": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "nodeInfo": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "phase": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_NodeSystemInfo": {
                "type": string;
                "description": string;
                "properties": {
                    "bootID": {
                        "type": string;
                        "description": string;
                    };
                    "containerRuntimeVersion": {
                        "type": string;
                        "description": string;
                    };
                    "kernelVersion": {
                        "type": string;
                        "description": string;
                    };
                    "kubeProxyVersion": {
                        "type": string;
                        "description": string;
                    };
                    "kubeletVersion": {
                        "type": string;
                        "description": string;
                    };
                    "machineID": {
                        "type": string;
                        "description": string;
                    };
                    "osImage": {
                        "type": string;
                        "description": string;
                    };
                    "systemUUID": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ObjectFieldSelector": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                    };
                    "fieldPath": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ObjectMeta": {
                "type": string;
                "description": string;
                "properties": {
                    "annotations": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "type": string;
                            "description": string;
                        };
                        "javaType": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                        "description": string;
                    };
                    "deletionTimestamp": {
                        "type": string;
                        "description": string;
                    };
                    "generateName": {
                        "type": string;
                        "description": string;
                    };
                    "generation": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                    "labels": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "type": string;
                            "description": string;
                        };
                        "javaType": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                        "maxLength": number;
                        "pattern": string;
                    };
                    "namespace": {
                        "type": string;
                        "description": string;
                        "maxLength": number;
                        "pattern": string;
                    };
                    "resourceVersion": {
                        "type": string;
                        "description": string;
                    };
                    "selfLink": {
                        "type": string;
                        "description": string;
                    };
                    "uid": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ObjectReference": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                    };
                    "fieldPath": {
                        "type": string;
                        "description": string;
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                    };
                    "namespace": {
                        "type": string;
                        "description": string;
                    };
                    "resourceVersion": {
                        "type": string;
                        "description": string;
                    };
                    "uid": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_PersistentVolume": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_PersistentVolumeClaim": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_PersistentVolumeClaimList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_PersistentVolumeClaimSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "accessModes": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "resources": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "volumeName": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_PersistentVolumeClaimStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "accessModes": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "capacity": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "javaType": string;
                    };
                    "phase": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_PersistentVolumeClaimVolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "claimName": {
                        "type": string;
                        "description": string;
                    };
                    "readOnly": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_PersistentVolumeList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_PersistentVolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "awsElasticBlockStore": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "cephfs": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "gcePersistentDisk": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "glusterfs": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "hostPath": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "iscsi": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "nfs": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "rbd": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_PersistentVolumeSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "accessModes": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "awsElasticBlockStore": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "capacity": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "javaType": string;
                    };
                    "cephfs": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "claimRef": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "gcePersistentDisk": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "glusterfs": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "hostPath": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "iscsi": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "nfs": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "persistentVolumeReclaimPolicy": {
                        "type": string;
                        "description": string;
                    };
                    "rbd": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_PersistentVolumeStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "message": {
                        "type": string;
                        "description": string;
                    };
                    "phase": {
                        "type": string;
                        "description": string;
                    };
                    "reason": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_Pod": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_PodCondition": {
                "type": string;
                "description": string;
                "properties": {
                    "status": {
                        "type": string;
                        "description": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_PodList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_PodSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "activeDeadlineSeconds": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                    "containers": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "dnsPolicy": {
                        "type": string;
                        "description": string;
                    };
                    "host": {
                        "type": string;
                        "description": string;
                    };
                    "hostNetwork": {
                        "type": string;
                        "description": string;
                    };
                    "imagePullSecrets": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "nodeName": {
                        "type": string;
                        "description": string;
                    };
                    "nodeSelector": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "type": string;
                            "description": string;
                        };
                        "javaType": string;
                    };
                    "restartPolicy": {
                        "type": string;
                        "description": string;
                    };
                    "serviceAccount": {
                        "type": string;
                        "description": string;
                    };
                    "serviceAccountName": {
                        "type": string;
                        "description": string;
                    };
                    "terminationGracePeriodSeconds": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                    "volumes": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_PodStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "conditions": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "containerStatuses": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "hostIP": {
                        "type": string;
                        "description": string;
                    };
                    "message": {
                        "type": string;
                        "description": string;
                    };
                    "phase": {
                        "type": string;
                        "description": string;
                    };
                    "podIP": {
                        "type": string;
                        "description": string;
                    };
                    "reason": {
                        "type": string;
                        "description": string;
                    };
                    "startTime": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_PodTemplateSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_Probe": {
                "type": string;
                "description": string;
                "properties": {
                    "exec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "httpGet": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "initialDelaySeconds": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                    "tcpSocket": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "timeoutSeconds": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_RBDVolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "fsType": {
                        "type": string;
                        "description": string;
                    };
                    "image": {
                        "type": string;
                        "description": string;
                    };
                    "keyring": {
                        "type": string;
                        "description": string;
                    };
                    "monitors": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "pool": {
                        "type": string;
                        "description": string;
                    };
                    "readOnly": {
                        "type": string;
                        "description": string;
                    };
                    "secretRef": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "user": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ReplicationController": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_ReplicationControllerList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_ReplicationControllerSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "replicas": {
                        "type": string;
                        "description": string;
                    };
                    "selector": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "type": string;
                            "description": string;
                        };
                        "javaType": string;
                    };
                    "template": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ReplicationControllerStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "observedGeneration": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                    "replicas": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ResourceQuota": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_ResourceQuotaList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_ResourceQuotaSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "hard": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ResourceQuotaStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "hard": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "javaType": string;
                    };
                    "used": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ResourceRequirements": {
                "type": string;
                "description": string;
                "properties": {
                    "limits": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "javaType": string;
                    };
                    "requests": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_RunAsUserStrategyOptions": {
                "type": string;
                "description": string;
                "properties": {
                    "type": {
                        "type": string;
                        "description": string;
                    };
                    "uid": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                    "uidRangeMax": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                    "uidRangeMin": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_SELinuxContextStrategyOptions": {
                "type": string;
                "description": string;
                "properties": {
                    "seLinuxOptions": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_SELinuxOptions": {
                "type": string;
                "description": string;
                "properties": {
                    "level": {
                        "type": string;
                        "description": string;
                    };
                    "role": {
                        "type": string;
                        "description": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                    "user": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_Secret": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "data": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "type": string;
                            "description": string;
                        };
                        "javaType": string;
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_SecretList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_SecretVolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "secretName": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_SecurityContext": {
                "type": string;
                "description": string;
                "properties": {
                    "capabilities": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "privileged": {
                        "type": string;
                        "description": string;
                    };
                    "runAsNonRoot": {
                        "type": string;
                        "description": string;
                    };
                    "runAsUser": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                    "seLinuxOptions": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_SecurityContextConstraints": {
                "type": string;
                "description": string;
                "properties": {
                    "allowHostDirVolumePlugin": {
                        "type": string;
                        "description": string;
                    };
                    "allowHostNetwork": {
                        "type": string;
                        "description": string;
                    };
                    "allowHostPorts": {
                        "type": string;
                        "description": string;
                    };
                    "allowPrivilegedContainer": {
                        "type": string;
                        "description": string;
                    };
                    "allowedCapabilities": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "groups": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "runAsUser": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "seLinuxContext": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "users": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_SecurityContextConstraintsList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_Service": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_ServiceAccount": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "imagePullSecrets": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "secrets": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_ServiceAccountList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_ServiceList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "kubernetes_ServicePort": {
                "type": string;
                "description": string;
                "properties": {
                    "name": {
                        "type": string;
                        "description": string;
                        "maxLength": number;
                        "pattern": string;
                    };
                    "nodePort": {
                        "type": string;
                        "description": string;
                    };
                    "port": {
                        "type": string;
                        "description": string;
                    };
                    "protocol": {
                        "type": string;
                        "description": string;
                    };
                    "targetPort": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ServiceSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "clusterIP": {
                        "type": string;
                        "description": string;
                    };
                    "deprecatedPublicIPs": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "portalIP": {
                        "type": string;
                        "description": string;
                    };
                    "ports": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "selector": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "type": string;
                            "description": string;
                        };
                        "javaType": string;
                    };
                    "sessionAffinity": {
                        "type": string;
                        "description": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_ServiceStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "loadBalancer": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_Status": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "code": {
                        "type": string;
                        "description": string;
                    };
                    "details": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "message": {
                        "type": string;
                        "description": string;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "reason": {
                        "type": string;
                        "description": string;
                    };
                    "status": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_StatusCause": {
                "type": string;
                "description": string;
                "properties": {
                    "field": {
                        "type": string;
                        "description": string;
                    };
                    "message": {
                        "type": string;
                        "description": string;
                    };
                    "reason": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_StatusDetails": {
                "type": string;
                "description": string;
                "properties": {
                    "causes": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                    };
                    "retryAfterSeconds": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_TCPSocketAction": {
                "type": string;
                "description": string;
                "properties": {
                    "port": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_TypeMeta": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_Volume": {
                "type": string;
                "description": string;
                "properties": {
                    "awsElasticBlockStore": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "cephfs": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "emptyDir": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "gcePersistentDisk": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "gitRepo": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "glusterfs": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "hostPath": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "iscsi": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                        "maxLength": number;
                        "pattern": string;
                    };
                    "nfs": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "persistentVolumeClaim": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "rbd": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "secret": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_VolumeMount": {
                "type": string;
                "description": string;
                "properties": {
                    "mountPath": {
                        "type": string;
                        "description": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                    };
                    "readOnly": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_VolumeSource": {
                "type": string;
                "description": string;
                "properties": {
                    "awsElasticBlockStore": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "cephfs": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "emptyDir": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "gcePersistentDisk": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "gitRepo": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "glusterfs": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "hostPath": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "iscsi": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "nfs": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "persistentVolumeClaim": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "rbd": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "secret": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_config_AuthInfo": {
                "type": string;
                "description": string;
                "properties": {
                    "client-certificate": {
                        "type": string;
                        "description": string;
                    };
                    "client-certificate-data": {
                        "type": string;
                        "description": string;
                    };
                    "client-key": {
                        "type": string;
                        "description": string;
                    };
                    "client-key-data": {
                        "type": string;
                        "description": string;
                    };
                    "extensions": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "password": {
                        "type": string;
                        "description": string;
                    };
                    "token": {
                        "type": string;
                        "description": string;
                    };
                    "username": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_config_Cluster": {
                "type": string;
                "description": string;
                "properties": {
                    "api-version": {
                        "type": string;
                        "description": string;
                    };
                    "certificate-authority": {
                        "type": string;
                        "description": string;
                    };
                    "certificate-authority-data": {
                        "type": string;
                        "description": string;
                    };
                    "extensions": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "insecure-skip-tls-verify": {
                        "type": string;
                        "description": string;
                    };
                    "server": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_config_Config": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                    };
                    "clusters": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "contexts": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "current-context": {
                        "type": string;
                        "description": string;
                    };
                    "extensions": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                    };
                    "preferences": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "users": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_config_Context": {
                "type": string;
                "description": string;
                "properties": {
                    "cluster": {
                        "type": string;
                        "description": string;
                    };
                    "extensions": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "namespace": {
                        "type": string;
                        "description": string;
                    };
                    "user": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_config_NamedAuthInfo": {
                "type": string;
                "description": string;
                "properties": {
                    "name": {
                        "type": string;
                        "description": string;
                    };
                    "user": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_config_NamedCluster": {
                "type": string;
                "description": string;
                "properties": {
                    "cluster": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_config_NamedContext": {
                "type": string;
                "description": string;
                "properties": {
                    "context": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_config_NamedExtension": {
                "type": string;
                "description": string;
                "properties": {
                    "extension": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_config_Preferences": {
                "type": string;
                "description": string;
                "properties": {
                    "colors": {
                        "type": string;
                        "description": string;
                    };
                    "extensions": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_resource_Quantity": {
                "type": string;
                "description": string;
                "properties": {
                    "Amount": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "Format": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_runtime_RawExtension": {
                "type": string;
                "description": string;
                "properties": {
                    "RawJSON": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_util_IntOrString": {
                "type": string;
                "description": string;
                "properties": {
                    "IntVal": {
                        "type": string;
                        "description": string;
                    };
                    "Kind": {
                        "type": string;
                        "description": string;
                    };
                    "StrVal": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "kubernetes_watch_WatchEvent": {
                "type": string;
                "description": string;
                "properties": {
                    "object": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_authorization_AuthorizationAttributes": {
                "type": string;
                "description": string;
                "properties": {
                    "content": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "namespace": {
                        "type": string;
                        "description": string;
                    };
                    "resource": {
                        "type": string;
                        "description": string;
                    };
                    "resourceName": {
                        "type": string;
                        "description": string;
                    };
                    "verb": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_authorization_ClusterPolicy": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "lastModified": {
                        "type": string;
                        "description": string;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "roles": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_ClusterPolicyBinding": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "lastModified": {
                        "type": string;
                        "description": string;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "policyRef": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "roleBindings": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_ClusterPolicyBindingList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_ClusterPolicyList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_ClusterRole": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "rules": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_ClusterRoleBinding": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "groupNames": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "roleRef": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "subjects": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "userNames": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_ClusterRoleBindingList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_LocalSubjectAccessReview": {
                "type": string;
                "description": string;
                "properties": {
                    "TypeMeta": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "content": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "groups": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "namespace": {
                        "type": string;
                        "description": string;
                    };
                    "resource": {
                        "type": string;
                        "description": string;
                    };
                    "resourceName": {
                        "type": string;
                        "description": string;
                    };
                    "user": {
                        "type": string;
                        "description": string;
                    };
                    "verb": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_authorization_NamedClusterRole": {
                "type": string;
                "description": string;
                "properties": {
                    "name": {
                        "type": string;
                        "description": string;
                    };
                    "role": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_authorization_NamedClusterRoleBinding": {
                "type": string;
                "description": string;
                "properties": {
                    "name": {
                        "type": string;
                        "description": string;
                    };
                    "roleBinding": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_authorization_NamedRole": {
                "type": string;
                "description": string;
                "properties": {
                    "name": {
                        "type": string;
                        "description": string;
                    };
                    "role": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_authorization_NamedRoleBinding": {
                "type": string;
                "description": string;
                "properties": {
                    "name": {
                        "type": string;
                        "description": string;
                    };
                    "roleBinding": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_authorization_Policy": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "lastModified": {
                        "type": string;
                        "description": string;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "roles": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_PolicyBinding": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "lastModified": {
                        "type": string;
                        "description": string;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "policyRef": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "roleBindings": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_PolicyBindingList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_PolicyList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_PolicyRule": {
                "type": string;
                "description": string;
                "properties": {
                    "attributeRestrictions": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "nonResourceURLs": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "resourceNames": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "resources": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "verbs": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_authorization_Role": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "rules": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_RoleBinding": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "groupNames": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "roleRef": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "subjects": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "userNames": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_RoleBindingList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_RoleList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_authorization_SubjectAccessReview": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "content": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "groups": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "namespace": {
                        "type": string;
                        "description": string;
                    };
                    "resource": {
                        "type": string;
                        "description": string;
                    };
                    "resourceName": {
                        "type": string;
                        "description": string;
                    };
                    "user": {
                        "type": string;
                        "description": string;
                    };
                    "verb": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_authorization_SubjectAccessReviewResponse": {
                "type": string;
                "description": string;
                "properties": {
                    "allowed": {
                        "type": string;
                        "description": string;
                    };
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "namespace": {
                        "type": string;
                        "description": string;
                    };
                    "reason": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_Build": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_build_BuildConfig": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_build_BuildConfigList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_build_BuildConfigSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "output": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "resources": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "revision": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "serviceAccount": {
                        "type": string;
                        "description": string;
                    };
                    "source": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "strategy": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "triggers": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_BuildConfigStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "lastVersion": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_BuildList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_build_BuildOutput": {
                "type": string;
                "description": string;
                "properties": {
                    "pushSecret": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "to": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_BuildRequest": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "from": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "lastVersion": {
                        "type": string;
                        "description": string;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "revision": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "triggeredByImage": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_build_BuildSource": {
                "type": string;
                "description": string;
                "properties": {
                    "contextDir": {
                        "type": string;
                        "description": string;
                    };
                    "git": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "sourceSecret": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_BuildSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "output": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "resources": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "revision": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "serviceAccount": {
                        "type": string;
                        "description": string;
                    };
                    "source": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "strategy": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_BuildStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "cancelled": {
                        "type": string;
                        "description": string;
                    };
                    "completionTimestamp": {
                        "type": string;
                        "description": string;
                    };
                    "config": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "duration": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                    "message": {
                        "type": string;
                        "description": string;
                    };
                    "phase": {
                        "type": string;
                        "description": string;
                    };
                    "startTimestamp": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_BuildStrategy": {
                "type": string;
                "description": string;
                "properties": {
                    "customStrategy": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "dockerStrategy": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "sourceStrategy": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_BuildTriggerPolicy": {
                "type": string;
                "description": string;
                "properties": {
                    "generic": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "github": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "imageChange": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_CustomBuildStrategy": {
                "type": string;
                "description": string;
                "properties": {
                    "env": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "exposeDockerSocket": {
                        "type": string;
                        "description": string;
                    };
                    "forcePull": {
                        "type": string;
                        "description": string;
                    };
                    "from": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "pullSecret": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_DockerBuildStrategy": {
                "type": string;
                "description": string;
                "properties": {
                    "env": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "forcePull": {
                        "type": string;
                        "description": string;
                    };
                    "from": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "noCache": {
                        "type": string;
                        "description": string;
                    };
                    "pullSecret": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_GitBuildSource": {
                "type": string;
                "description": string;
                "properties": {
                    "httpProxy": {
                        "type": string;
                        "description": string;
                    };
                    "httpsProxy": {
                        "type": string;
                        "description": string;
                    };
                    "ref": {
                        "type": string;
                        "description": string;
                    };
                    "uri": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_GitSourceRevision": {
                "type": string;
                "description": string;
                "properties": {
                    "author": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "commit": {
                        "type": string;
                        "description": string;
                    };
                    "committer": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "message": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_ImageChangeTrigger": {
                "type": string;
                "description": string;
                "properties": {
                    "from": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "lastTriggeredImageID": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_SourceBuildStrategy": {
                "type": string;
                "description": string;
                "properties": {
                    "env": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "forcePull": {
                        "type": string;
                        "description": string;
                    };
                    "from": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "incremental": {
                        "type": string;
                        "description": string;
                    };
                    "pullSecret": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "scripts": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_SourceControlUser": {
                "type": string;
                "description": string;
                "properties": {
                    "email": {
                        "type": string;
                        "description": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_SourceRevision": {
                "type": string;
                "description": string;
                "properties": {
                    "git": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_build_WebHookTrigger": {
                "type": string;
                "description": string;
                "properties": {
                    "secret": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_deploy_CustomDeploymentStrategyParams": {
                "type": string;
                "description": string;
                "properties": {
                    "command": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "environment": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "image": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_deploy_DeploymentCause": {
                "type": string;
                "description": string;
                "properties": {
                    "imageTrigger": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_deploy_DeploymentCauseImageTrigger": {
                "type": string;
                "description": string;
                "properties": {
                    "from": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_deploy_DeploymentConfig": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_deploy_DeploymentConfigList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_deploy_DeploymentConfigSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "replicas": {
                        "type": string;
                        "description": string;
                    };
                    "selector": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "type": string;
                            "description": string;
                        };
                        "javaType": string;
                    };
                    "strategy": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "template": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "triggers": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_deploy_DeploymentConfigStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "details": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "latestVersion": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_deploy_DeploymentDetails": {
                "type": string;
                "description": string;
                "properties": {
                    "causes": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "message": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_deploy_DeploymentStrategy": {
                "type": string;
                "description": string;
                "properties": {
                    "customParams": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "recreateParams": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "resources": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "rollingParams": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_deploy_DeploymentTriggerImageChangeParams": {
                "type": string;
                "description": string;
                "properties": {
                    "automatic": {
                        "type": string;
                        "description": string;
                    };
                    "containerNames": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "from": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "lastTriggeredImage": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_deploy_DeploymentTriggerPolicy": {
                "type": string;
                "description": string;
                "properties": {
                    "imageChangeParams": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_deploy_ExecNewPodHook": {
                "type": string;
                "description": string;
                "properties": {
                    "command": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "containerName": {
                        "type": string;
                        "description": string;
                    };
                    "env": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_deploy_LifecycleHook": {
                "type": string;
                "description": string;
                "properties": {
                    "execNewPod": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "failurePolicy": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_deploy_RecreateDeploymentStrategyParams": {
                "type": string;
                "description": string;
                "properties": {
                    "post": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "pre": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_deploy_RollingDeploymentStrategyParams": {
                "type": string;
                "description": string;
                "properties": {
                    "intervalSeconds": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                    "post": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "pre": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "timeoutSeconds": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                    "updatePercent": {
                        "type": string;
                        "description": string;
                    };
                    "updatePeriodSeconds": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_image_Image": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "dockerImageManifest": {
                        "type": string;
                        "description": string;
                    };
                    "dockerImageMetadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "dockerImageMetadataVersion": {
                        "type": string;
                        "description": string;
                    };
                    "dockerImageReference": {
                        "type": string;
                        "description": string;
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_image_ImageList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_image_ImageStream": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_image_ImageStreamList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_image_ImageStreamSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "dockerImageRepository": {
                        "type": string;
                        "description": string;
                    };
                    "tags": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_image_ImageStreamStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "dockerImageRepository": {
                        "type": string;
                        "description": string;
                    };
                    "tags": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_image_NamedTagEventList": {
                "type": string;
                "description": string;
                "properties": {
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "tag": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_image_NamedTagReference": {
                "type": string;
                "description": string;
                "properties": {
                    "annotations": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "type": string;
                            "description": string;
                        };
                        "javaType": string;
                    };
                    "from": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_image_TagEvent": {
                "type": string;
                "description": string;
                "properties": {
                    "created": {
                        "type": string;
                        "description": string;
                    };
                    "dockerImageReference": {
                        "type": string;
                        "description": string;
                    };
                    "image": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_oauth_OAuthAccessToken": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "authorizeToken": {
                        "type": string;
                        "description": string;
                    };
                    "clientName": {
                        "type": string;
                        "description": string;
                    };
                    "expiresIn": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "redirectURI": {
                        "type": string;
                        "description": string;
                    };
                    "refreshToken": {
                        "type": string;
                        "description": string;
                    };
                    "scopes": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "userName": {
                        "type": string;
                        "description": string;
                    };
                    "userUID": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_oauth_OAuthAccessTokenList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_oauth_OAuthAuthorizeToken": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "clientName": {
                        "type": string;
                        "description": string;
                    };
                    "expiresIn": {
                        "type": string;
                        "description": string;
                        "javaType": string;
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "redirectURI": {
                        "type": string;
                        "description": string;
                    };
                    "scopes": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "state": {
                        "type": string;
                        "description": string;
                    };
                    "userName": {
                        "type": string;
                        "description": string;
                    };
                    "userUID": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_oauth_OAuthAuthorizeTokenList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_oauth_OAuthClient": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "redirectURIs": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "respondWithChallenges": {
                        "type": string;
                        "description": string;
                    };
                    "secret": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_oauth_OAuthClientAuthorization": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "clientName": {
                        "type": string;
                        "description": string;
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "scopes": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "userName": {
                        "type": string;
                        "description": string;
                    };
                    "userUID": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_oauth_OAuthClientAuthorizationList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_oauth_OAuthClientList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_project_Project": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_project_ProjectList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_project_ProjectRequest": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "description": {
                        "type": string;
                        "description": string;
                    };
                    "displayName": {
                        "type": string;
                        "description": string;
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_project_ProjectSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "finalizers": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_project_ProjectStatus": {
                "type": string;
                "description": string;
                "properties": {
                    "phase": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_route_Route": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_route_RouteList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_route_RouteSpec": {
                "type": string;
                "description": string;
                "properties": {
                    "host": {
                        "type": string;
                        "description": string;
                    };
                    "path": {
                        "type": string;
                        "description": string;
                    };
                    "tls": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "to": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_route_RouteStatus": {
                "type": string;
                "description": string;
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_route_TLSConfig": {
                "type": string;
                "description": string;
                "properties": {
                    "caCertificate": {
                        "type": string;
                        "description": string;
                    };
                    "certificate": {
                        "type": string;
                        "description": string;
                    };
                    "destinationCACertificate": {
                        "type": string;
                        "description": string;
                    };
                    "key": {
                        "type": string;
                        "description": string;
                    };
                    "termination": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_template_Parameter": {
                "type": string;
                "description": string;
                "properties": {
                    "description": {
                        "type": string;
                        "description": string;
                    };
                    "from": {
                        "type": string;
                        "description": string;
                    };
                    "generate": {
                        "type": string;
                        "description": string;
                    };
                    "name": {
                        "type": string;
                        "description": string;
                    };
                    "required": {
                        "type": string;
                        "description": string;
                    };
                    "value": {
                        "type": string;
                        "description": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
            };
            "os_template_Template": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "labels": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "type": string;
                            "description": string;
                        };
                        "javaType": string;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "objects": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "parameters": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_template_TemplateList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_user_Group": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "users": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_user_GroupList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_user_Identity": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "extra": {
                        "type": string;
                        "description": string;
                        "additionalProperties": {
                            "type": string;
                            "description": string;
                        };
                        "javaType": string;
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "providerName": {
                        "type": string;
                        "description": string;
                    };
                    "providerUserName": {
                        "type": string;
                        "description": string;
                    };
                    "user": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_user_IdentityList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_user_User": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "fullName": {
                        "type": string;
                        "description": string;
                    };
                    "groups": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "identities": {
                        "type": string;
                        "description": string;
                        "items": {
                            "type": string;
                            "description": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "os_user_UserList": {
                "type": string;
                "description": string;
                "properties": {
                    "apiVersion": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                        "enum": string[];
                    };
                    "items": {
                        "type": string;
                        "description": string;
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                    };
                    "kind": {
                        "type": string;
                        "description": string;
                        "default": string;
                        "required": boolean;
                    };
                    "metadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "additionalProperties": boolean;
                "javaType": string;
                "javaInterfaces": string[];
            };
            "speter_inf_Dec": {
                "type": string;
                "description": string;
                "additionalProperties": boolean;
                "javaType": string;
            };
        };
        "type": string;
        "properties": {
            "BaseKubernetesList": {
                "$ref": string;
                "javaType": string;
            };
            "BuildConfigList": {
                "$ref": string;
                "javaType": string;
            };
            "BuildList": {
                "$ref": string;
                "javaType": string;
            };
            "BuildRequest": {
                "$ref": string;
                "javaType": string;
            };
            "ClusterPolicy": {
                "$ref": string;
                "javaType": string;
            };
            "ClusterPolicyBinding": {
                "$ref": string;
                "javaType": string;
            };
            "ClusterPolicyBindingList": {
                "$ref": string;
                "javaType": string;
            };
            "ClusterPolicyList": {
                "$ref": string;
                "javaType": string;
            };
            "ClusterRoleBinding": {
                "$ref": string;
                "javaType": string;
            };
            "ClusterRoleBindingList": {
                "$ref": string;
                "javaType": string;
            };
            "Config": {
                "$ref": string;
                "javaType": string;
            };
            "ContainerStatus": {
                "$ref": string;
                "javaType": string;
            };
            "DeploymentConfigList": {
                "$ref": string;
                "javaType": string;
            };
            "Endpoints": {
                "$ref": string;
                "javaType": string;
            };
            "EndpointsList": {
                "$ref": string;
                "javaType": string;
            };
            "EnvVar": {
                "$ref": string;
                "javaType": string;
            };
            "EventList": {
                "$ref": string;
                "javaType": string;
            };
            "Group": {
                "$ref": string;
                "javaType": string;
            };
            "GroupList": {
                "$ref": string;
                "javaType": string;
            };
            "Identity": {
                "$ref": string;
                "javaType": string;
            };
            "IdentityList": {
                "$ref": string;
                "javaType": string;
            };
            "ImageList": {
                "$ref": string;
                "javaType": string;
            };
            "ImageStreamList": {
                "$ref": string;
                "javaType": string;
            };
            "LocalSubjectAccessReview": {
                "$ref": string;
                "javaType": string;
            };
            "Namespace": {
                "$ref": string;
                "javaType": string;
            };
            "NamespaceList": {
                "$ref": string;
                "javaType": string;
            };
            "Node": {
                "$ref": string;
                "javaType": string;
            };
            "NodeList": {
                "$ref": string;
                "javaType": string;
            };
            "OAuthAccessToken": {
                "$ref": string;
                "javaType": string;
            };
            "OAuthAccessTokenList": {
                "$ref": string;
                "javaType": string;
            };
            "OAuthAuthorizeToken": {
                "$ref": string;
                "javaType": string;
            };
            "OAuthAuthorizeTokenList": {
                "$ref": string;
                "javaType": string;
            };
            "OAuthClient": {
                "$ref": string;
                "javaType": string;
            };
            "OAuthClientAuthorization": {
                "$ref": string;
                "javaType": string;
            };
            "OAuthClientAuthorizationList": {
                "$ref": string;
                "javaType": string;
            };
            "OAuthClientList": {
                "$ref": string;
                "javaType": string;
            };
            "ObjectMeta": {
                "$ref": string;
                "javaType": string;
            };
            "PersistentVolume": {
                "$ref": string;
                "javaType": string;
            };
            "PersistentVolumeClaim": {
                "$ref": string;
                "javaType": string;
            };
            "PersistentVolumeClaimList": {
                "$ref": string;
                "javaType": string;
            };
            "PersistentVolumeList": {
                "$ref": string;
                "javaType": string;
            };
            "PodList": {
                "$ref": string;
                "javaType": string;
            };
            "Policy": {
                "$ref": string;
                "javaType": string;
            };
            "PolicyBinding": {
                "$ref": string;
                "javaType": string;
            };
            "PolicyBindingList": {
                "$ref": string;
                "javaType": string;
            };
            "PolicyList": {
                "$ref": string;
                "javaType": string;
            };
            "Project": {
                "$ref": string;
                "javaType": string;
            };
            "ProjectList": {
                "$ref": string;
                "javaType": string;
            };
            "ProjectRequest": {
                "$ref": string;
                "javaType": string;
            };
            "Quantity": {
                "$ref": string;
                "javaType": string;
            };
            "ReplicationControllerList": {
                "$ref": string;
                "javaType": string;
            };
            "ResourceQuota": {
                "$ref": string;
                "javaType": string;
            };
            "ResourceQuotaList": {
                "$ref": string;
                "javaType": string;
            };
            "Role": {
                "$ref": string;
                "javaType": string;
            };
            "RoleBinding": {
                "$ref": string;
                "javaType": string;
            };
            "RoleBindingList": {
                "$ref": string;
                "javaType": string;
            };
            "RoleList": {
                "$ref": string;
                "javaType": string;
            };
            "RootPaths": {
                "$ref": string;
                "javaType": string;
            };
            "RouteList": {
                "$ref": string;
                "javaType": string;
            };
            "Secret": {
                "$ref": string;
                "javaType": string;
            };
            "SecretList": {
                "$ref": string;
                "javaType": string;
            };
            "SecurityContextConstraints": {
                "$ref": string;
                "javaType": string;
            };
            "SecurityContextConstraintsList": {
                "$ref": string;
                "javaType": string;
            };
            "ServiceAccount": {
                "$ref": string;
                "javaType": string;
            };
            "ServiceAccountList": {
                "$ref": string;
                "javaType": string;
            };
            "ServiceList": {
                "$ref": string;
                "javaType": string;
            };
            "Status": {
                "$ref": string;
                "javaType": string;
            };
            "SubjectAccessReview": {
                "$ref": string;
                "javaType": string;
            };
            "SubjectAccessReviewResponse": {
                "$ref": string;
                "javaType": string;
            };
            "TagEvent": {
                "$ref": string;
                "javaType": string;
            };
            "Template": {
                "$ref": string;
                "javaType": string;
            };
            "TemplateList": {
                "$ref": string;
                "javaType": string;
            };
            "User": {
                "$ref": string;
                "javaType": string;
            };
            "UserList": {
                "$ref": string;
                "javaType": string;
            };
            "WatchEvent": {
                "$ref": string;
                "javaType": string;
            };
        };
        "additionalProperties": boolean;
    };
}
