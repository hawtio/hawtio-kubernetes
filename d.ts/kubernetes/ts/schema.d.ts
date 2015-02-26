/// <reference path="../../includes.d.ts" />
/// <reference path="kubernetesHelpers.d.ts" />
/// <reference path="kubernetesPlugin.d.ts" />
declare module Kubernetes {
    var schema: {
        "$schema": string;
        "additionalProperties": boolean;
        "definitions": {
            "docker_Config": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "AttachStderr": {
                        "type": string;
                    };
                    "AttachStdin": {
                        "type": string;
                    };
                    "AttachStdout": {
                        "type": string;
                    };
                    "Cmd": {
                        "items": {
                            "type": string;
                        };
                        "type": string;
                    };
                    "CpuSet": {
                        "type": string;
                    };
                    "CpuShares": {
                        "type": string;
                    };
                    "Dns": {
                        "items": {
                            "type": string;
                        };
                        "type": string;
                    };
                    "Domainname": {
                        "type": string;
                    };
                    "Entrypoint": {
                        "items": {
                            "type": string;
                        };
                        "type": string;
                    };
                    "Env": {
                        "items": {
                            "type": string;
                        };
                        "type": string;
                    };
                    "ExposedPorts": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "Hostname": {
                        "type": string;
                    };
                    "Image": {
                        "type": string;
                    };
                    "Memory": {
                        "type": string;
                    };
                    "MemorySwap": {
                        "type": string;
                    };
                    "NetworkDisabled": {
                        "type": string;
                    };
                    "OpenStdin": {
                        "type": string;
                    };
                    "PortSpecs": {
                        "items": {
                            "type": string;
                        };
                        "type": string;
                    };
                    "StdinOnce": {
                        "type": string;
                    };
                    "Tty": {
                        "type": string;
                    };
                    "User": {
                        "type": string;
                    };
                    "Volumes": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "VolumesFrom": {
                        "type": string;
                    };
                    "WorkingDir": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "docker_Image": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "Architecture": {
                        "type": string;
                    };
                    "Author": {
                        "type": string;
                    };
                    "Comment": {
                        "type": string;
                    };
                    "Config": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "Container": {
                        "type": string;
                    };
                    "ContainerConfig": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "Created": {
                        "type": string;
                    };
                    "DockerVersion": {
                        "type": string;
                    };
                    "Id": {
                        "type": string;
                    };
                    "Parent": {
                        "type": string;
                    };
                    "Size": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_Container": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "command": {
                        "items": {
                            "type": string;
                        };
                        "type": string;
                    };
                    "cpu": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "env": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "image": {
                        "type": string;
                    };
                    "imagePullPolicy": {
                        "type": string;
                    };
                    "lifecycle": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "livenessProbe": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "memory": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "ports": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "privileged": {
                        "type": string;
                    };
                    "terminationMessagePath": {
                        "type": string;
                    };
                    "volumeMounts": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "workingDir": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_EmptyDir": {
                "additionalProperties": boolean;
                "javaType": string;
                "type": string;
            };
            "kubernetes_base_EnvVar": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "name": {
                        "type": string;
                    };
                    "value": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_ExecAction": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "command": {
                        "items": {
                            "type": string;
                        };
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_GCEPersistentDisk": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "fsType": {
                        "type": string;
                    };
                    "partition": {
                        "type": string;
                    };
                    "pdName": {
                        "type": string;
                    };
                    "readOnly": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_GitRepo": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "repository": {
                        "type": string;
                    };
                    "revision": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_HTTPGetAction": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "host": {
                        "type": string;
                    };
                    "path": {
                        "type": string;
                    };
                    "port": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_Handler": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "exec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "httpGet": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_HostDir": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "path": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_Lifecycle": {
                "additionalProperties": boolean;
                "javaType": string;
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
                "type": string;
            };
            "kubernetes_base_ListMeta": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_LivenessProbe": {
                "additionalProperties": boolean;
                "javaType": string;
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
                    };
                    "tcpSocket": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_ObjectMeta": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_ObjectReference": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "fieldPath": {
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_PodSpec": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "containers": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "dnsPolicy": {
                        "type": string;
                    };
                    "host": {
                        "type": string;
                    };
                    "nodeSelector": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "restartPolicy": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "volumes": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_PodTemplateSpec": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "spec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_Port": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "containerPort": {
                        "type": string;
                    };
                    "hostIP": {
                        "type": string;
                    };
                    "hostPort": {
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "protocol": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_ReplicationControllerSpec": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "replicas": {
                        "type": string;
                    };
                    "selector": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "template": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "templateRef": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_RestartPolicy": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "always": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "never": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "onFailure": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_RestartPolicyAlways": {
                "additionalProperties": boolean;
                "javaType": string;
                "type": string;
            };
            "kubernetes_base_RestartPolicyNever": {
                "additionalProperties": boolean;
                "javaType": string;
                "type": string;
            };
            "kubernetes_base_RestartPolicyOnFailure": {
                "additionalProperties": boolean;
                "javaType": string;
                "type": string;
            };
            "kubernetes_base_Status": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "code": {
                        "type": string;
                    };
                    "details": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "message": {
                        "type": string;
                    };
                    "reason": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "status": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_StatusCause": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "field": {
                        "type": string;
                    };
                    "message": {
                        "type": string;
                    };
                    "reason": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_StatusDetails": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "causes": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "id": {
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_TCPSocketAction": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "port": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_TypeMeta": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_Volume": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "name": {
                        "type": string;
                    };
                    "source": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_VolumeMount": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "mountPath": {
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "readOnly": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_base_VolumeSource": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "emptyDir": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "gitRepo": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "hostDir": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "persistentDisk": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_errors_StatusError": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "ErrStatus": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_resource_Quantity": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "Amount": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "Format": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_runtime_RawExtension": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "RawJSON": {
                        "items": {
                            "type": string;
                        };
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_util_IntOrString": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "IntVal": {
                        "type": string;
                    };
                    "Kind": {
                        "type": string;
                    };
                    "StrVal": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_Container": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "command": {
                        "items": {
                            "type": string;
                        };
                        "type": string;
                    };
                    "cpu": {
                        "type": string;
                    };
                    "env": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "image": {
                        "type": string;
                    };
                    "imagePullPolicy": {
                        "type": string;
                    };
                    "lifecycle": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "livenessProbe": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "memory": {
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "ports": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "privileged": {
                        "type": string;
                    };
                    "terminationMessagePath": {
                        "type": string;
                    };
                    "volumeMounts": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "workingDir": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_ContainerManifest": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "containers": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "dnsPolicy": {
                        "type": string;
                    };
                    "id": {
                        "type": string;
                    };
                    "restartPolicy": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "uuid": {
                        "type": string;
                    };
                    "version": {
                        "type": string;
                    };
                    "volumes": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_ContainerState": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "running": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "termination": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "waiting": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_ContainerStateRunning": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "startedAt": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_ContainerStateTerminated": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "exitCode": {
                        "type": string;
                    };
                    "finishedAt": {
                        "type": string;
                    };
                    "message": {
                        "type": string;
                    };
                    "reason": {
                        "type": string;
                    };
                    "signal": {
                        "type": string;
                    };
                    "startedAt": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_ContainerStateWaiting": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "reason": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_ContainerStatus": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "containerID": {
                        "type": string;
                    };
                    "image": {
                        "type": string;
                    };
                    "podIP": {
                        "type": string;
                    };
                    "restartCount": {
                        "type": string;
                    };
                    "state": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_EmptyDir": {
                "additionalProperties": boolean;
                "javaType": string;
                "type": string;
            };
            "kubernetes_v1beta2_Endpoints": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "endpoints": {
                        "items": {
                            "type": string;
                        };
                        "type": string;
                    };
                    "id": {
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_EndpointsList": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "id": {
                        "type": string;
                    };
                    "items": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_EnvVar": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "name": {
                        "type": string;
                    };
                    "value": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_ExecAction": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "command": {
                        "items": {
                            "type": string;
                        };
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_GCEPersistentDisk": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "fsType": {
                        "type": string;
                    };
                    "partition": {
                        "type": string;
                    };
                    "pdName": {
                        "type": string;
                    };
                    "readOnly": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_GitRepo": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "repository": {
                        "type": string;
                    };
                    "revision": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_HTTPGetAction": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "host": {
                        "type": string;
                    };
                    "path": {
                        "type": string;
                    };
                    "port": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_Handler": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "exec": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "httpGet": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_HostDir": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "path": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_Lifecycle": {
                "additionalProperties": boolean;
                "javaType": string;
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
                "type": string;
            };
            "kubernetes_v1beta2_List": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "id": {
                        "type": string;
                    };
                    "items": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_LivenessProbe": {
                "additionalProperties": boolean;
                "javaType": string;
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
                    };
                    "tcpSocket": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_Minion": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "hostIP": {
                        "type": string;
                    };
                    "id": {
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "resources": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_MinionList": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "id": {
                        "type": string;
                    };
                    "items": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_NodeCondition": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "kind": {
                        "type": string;
                    };
                    "lastTransitionTime": {
                        "type": string;
                    };
                    "message": {
                        "type": string;
                    };
                    "reason": {
                        "type": string;
                    };
                    "status": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_NodeResources": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "capacity": {
                        "additionalProperties": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_NodeStatus": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "conditions": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "phase": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_Pod": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "currentState": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "desiredState": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "id": {
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "nodeSelector": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_PodList": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "id": {
                        "type": string;
                    };
                    "items": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_PodState": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "host": {
                        "type": string;
                    };
                    "hostIP": {
                        "type": string;
                    };
                    "info": {
                        "additionalProperties": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "manifest": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "message": {
                        "type": string;
                    };
                    "podIP": {
                        "type": string;
                    };
                    "status": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_PodTemplate": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "desiredState": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_Port": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "containerPort": {
                        "type": string;
                    };
                    "hostIP": {
                        "type": string;
                    };
                    "hostPort": {
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "protocol": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_ReplicationController": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "currentState": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "desiredState": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "id": {
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_ReplicationControllerList": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "id": {
                        "type": string;
                    };
                    "items": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_ReplicationControllerState": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "podTemplate": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "replicaSelector": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "replicas": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_RestartPolicy": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "always": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "never": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "onFailure": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_RestartPolicyAlways": {
                "additionalProperties": boolean;
                "javaType": string;
                "type": string;
            };
            "kubernetes_v1beta2_RestartPolicyNever": {
                "additionalProperties": boolean;
                "javaType": string;
                "type": string;
            };
            "kubernetes_v1beta2_RestartPolicyOnFailure": {
                "additionalProperties": boolean;
                "javaType": string;
                "type": string;
            };
            "kubernetes_v1beta2_Service": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "containerPort": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "createExternalLoadBalancer": {
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "id": {
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "port": {
                        "type": string;
                    };
                    "portalIP": {
                        "type": string;
                    };
                    "protocol": {
                        "type": string;
                    };
                    "proxyPort": {
                        "type": string;
                    };
                    "publicIPs": {
                        "items": {
                            "type": string;
                        };
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selector": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "sessionAffinity": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_ServiceList": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "id": {
                        "type": string;
                    };
                    "items": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_TCPSocketAction": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "port": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_TypeMeta": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "id": {
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_Volume": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "name": {
                        "type": string;
                    };
                    "source": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_VolumeMount": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "mountPath": {
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "readOnly": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "kubernetes_v1beta2_VolumeSource": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "emptyDir": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "gitRepo": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "hostDir": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "persistentDisk": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "os_build_Build": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "cancelled": {
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "parameters": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "podName": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "status": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_BuildConfig": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "parameters": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "triggers": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_BuildConfigList": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "items": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_BuildList": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "items": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_BuildOutput": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "imageTag": {
                        "type": string;
                    };
                    "registry": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_BuildParameters": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "output": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "revision": {
                        "$ref": string;
                        "javaType": string;
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
                "type": string;
            };
            "os_build_BuildSource": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "git": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_BuildStrategy": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "customStrategy": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "dockerStrategy": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "stiStrategy": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_BuildTriggerPolicy": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "generic": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "github": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_CustomBuildStrategy": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "env": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "exposeDockerSocket": {
                        "type": string;
                    };
                    "image": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_DockerBuildStrategy": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "contextDir": {
                        "type": string;
                    };
                    "noCache": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_GitBuildSource": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "ref": {
                        "type": string;
                    };
                    "uri": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_GitSourceRevision": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "author": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "commit": {
                        "type": string;
                    };
                    "committer": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "message": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_STIBuildStrategy": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "clean": {
                        "type": string;
                    };
                    "image": {
                        "type": string;
                    };
                    "scripts": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_SourceControlUser": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "email": {
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_SourceRevision": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "git": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_build_WebHookTrigger": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "secret": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_config_Config": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "items": {
                        "items": {};
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_deploy_CustomDeploymentStrategyParams": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "command": {
                        "items": {
                            "type": string;
                        };
                        "type": string;
                    };
                    "environment": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "image": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_deploy_Deployment": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "controllerTemplate": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "details": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "status": {
                        "type": string;
                    };
                    "strategy": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_deploy_DeploymentCause": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "imageTrigger": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_deploy_DeploymentCauseImageTrigger": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "repositoryName": {
                        "type": string;
                    };
                    "tag": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_deploy_DeploymentConfig": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "details": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "latestVersion": {
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "template": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "triggers": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_deploy_DeploymentConfigList": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "items": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_deploy_DeploymentDetails": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "causes": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "message": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_deploy_DeploymentList": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "items": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_deploy_DeploymentStrategy": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "customParams": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_deploy_DeploymentTemplate": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "controllerTemplate": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "strategy": {
                        "$ref": string;
                        "javaType": string;
                    };
                };
                "type": string;
            };
            "os_deploy_DeploymentTriggerImageChangeParams": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "automatic": {
                        "type": string;
                    };
                    "containerNames": {
                        "items": {
                            "type": string;
                        };
                        "type": string;
                    };
                    "repositoryName": {
                        "type": string;
                    };
                    "tag": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_deploy_DeploymentTriggerPolicy": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "imageChangeParams": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "type": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_image_Image": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "dockerImageMetadata": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "dockerImageReference": {
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_image_ImageList": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "items": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_image_ImageRepository": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "dockerImageRepository": {
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "status": {
                        "$ref": string;
                        "javaType": string;
                    };
                    "tags": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_image_ImageRepositoryList": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "items": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_image_ImageRepositoryStatus": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "dockerImageRepository": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_route_Route": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "host": {
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "path": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "serviceName": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_route_RouteList": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "items": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_template_Parameter": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "Description": {
                        "type": string;
                    };
                    "From": {
                        "type": string;
                    };
                    "Generate": {
                        "type": string;
                    };
                    "Name": {
                        "type": string;
                    };
                    "Value": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "os_template_Template": {
                "additionalProperties": boolean;
                "javaType": string;
                "properties": {
                    "ObjectLabels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "Objects": {
                        "items": {};
                        "type": string;
                    };
                    "Parameters": {
                        "items": {
                            "$ref": string;
                            "javaType": string;
                        };
                        "type": string;
                    };
                    "annotations": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "apiVersion": {
                        "default": string;
                        "type": string;
                    };
                    "creationTimestamp": {
                        "type": string;
                    };
                    "kind": {
                        "type": string;
                    };
                    "labels": {
                        "additionalProperties": {
                            "type": string;
                        };
                        "javaType": string;
                        "type": string;
                    };
                    "name": {
                        "type": string;
                    };
                    "namespace": {
                        "type": string;
                    };
                    "resourceVersion": {
                        "type": string;
                    };
                    "selfLink": {
                        "type": string;
                    };
                    "uid": {
                        "type": string;
                    };
                };
                "type": string;
            };
            "speter_inf_Dec": {
                "additionalProperties": boolean;
                "javaType": string;
                "type": string;
            };
        };
        "id": string;
        "properties": {
            "BuildConfigList": {
                "$ref": string;
                "javaType": string;
            };
            "BuildList": {
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
            "DeploymentList": {
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
            "ImageList": {
                "$ref": string;
                "javaType": string;
            };
            "ImageRepositoryList": {
                "$ref": string;
                "javaType": string;
            };
            "KubernetesList": {
                "$ref": string;
                "javaType": string;
            };
            "Minion": {
                "$ref": string;
                "javaType": string;
            };
            "MinionList": {
                "$ref": string;
                "javaType": string;
            };
            "PodList": {
                "$ref": string;
                "javaType": string;
            };
            "ReplicationControllerList": {
                "$ref": string;
                "javaType": string;
            };
            "RouteList": {
                "$ref": string;
                "javaType": string;
            };
            "ServiceList": {
                "$ref": string;
                "javaType": string;
            };
            "StatusError": {
                "$ref": string;
                "javaType": string;
            };
            "Template": {
                "$ref": string;
                "javaType": string;
            };
        };
        "type": string;
    };
}
