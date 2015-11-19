/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var SecretController = controller("SecretController",
    ["$scope", "KubernetesModel", "KubernetesState", "KubernetesSchema", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL", "K8SClientFactory",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService, KubernetesState, KubernetesSchema,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL, K8SClientFactory) => {

        $scope.kubernetes = KubernetesState;
        $scope.model = KubernetesModel;
        $scope.id = $routeParams["id"];

        Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);
        selectSubNavBar($scope, "Secrets", $scope.id ? "Edit Secret: " + $scope.id : "Create Secret");

        var kubeClient = createKubernetesClient("secrets");

        var onSaveUrl = $location.search()["savedUrl"];
        var createKind = $location.search()["kind"];

        $scope.sshKeys = ["ssh-key", "ssh-key.pub"];
        $scope.httpsKeys = ["username", "password"];

        var secretLabels = {
          "ssh-key": "SSH private key",
          "ssh-key.pub": "SSH public key",
          "ca.crt": "CA Certificate",
          ".dockercfg": "Docker config",
          "username": "User name"
        };
        var secretTooltips = {
          "ssh-key": "SSH private key text contents",
          "ca.crt": "Certificate Authority (CA) Certificate",
          ".dockercfg": "Docker configuration token"
        };


        $scope.$on('kubernetesModelUpdated', function () {
          if ($scope.id && !$scope.secret) {
            updateData();
          }
        });

        $scope.$on('$routeUpdate', ($event) => {
          updateData();
        });

        $scope.propertyKeys = () => {
          return _.keys(secretLabels);
        };

        $scope.checkNameUnique = (value) => {
          var answer = true;
          angular.forEach($scope.model.secrets, (secret) => {
            var name = getName(secret);
            if (value === name) {
              answer = false;
            }
          });
          return answer;
        };

        $scope.checkFieldUnique = (key) => {
          return $scope.entity.properties[key] ? false : true;
        };

        $scope.hasAllKeys = (keys) => {
          var answer = keys && keys.length;
          angular.forEach(keys, (key) => {
            if (!$scope.entity.properties[key]) {
              answer = false;
            }
          });
          return answer;
        };

        $scope.addFieldDialog = {
          controller: null,
          newReplicas: 0,
          dialog: new UI.Dialog(),
          onOk: () => {
            $scope.addFieldDialog.dialog.close();
            $scope.addDataField();
          },
          open: (controller) => {
            var addFieldDialog = $scope.addFieldDialog;
            addFieldDialog.dialog.open();

            $timeout(() => {
              $('#newDataName').focus();
            }, 50);
          },
          close: () => {
            $scope.addFieldDialog.dialog.close();
          }
        };



        $scope.entityChanged = () => {
          $scope.changed = true;
        };

        $scope.addFields = (keys) => {
          log.info("Adding fields " + keys);
          angular.forEach(keys, (key) => addField(key));
          Core.$apply($scope);
        };

        function addField(key) {
          var property = createProperty(key, "");
          $scope.entity.properties[key] = property;
          $scope.entity.newDataKey = "";
          $scope.showAddDataFieldForm = false;
          $scope.entityChanged();
          log.info("Added key '" + key + "'");
        }

        $scope.addDataField = () => {
          var key = $scope.entity.newDataKey;
          if (key) {
            addField(key);
            Core.$apply($scope);
          }
        };

        $scope.deleteProperty = (key) => {
          if (key) {
            delete $scope.entity.properties[key];
            $scope.entityChanged();
            Core.$apply($scope);
          }
        };

        $scope.cancel = () => {
          updateData();
        };

        $scope.save = () => {
          var entity = $scope.entity || {};
          var name = entity.name;
          if (name) {
            if (!$scope.secret) {
              $scope.secret = {
                apiVersion: Kubernetes.defaultApiVersion,
                kind: "Secret",
                metadata: {
                  name: ""
                },
                data: {}
              }
            }
            var data = {};
            angular.forEach(entity.properties, (property) => {
              var key = property.key;
              var value = property.value || "";
              if (key) {
                data[key] = value.encodeBase64();
              }
            });
            $scope.secret.metadata.name = name;
            $scope.secret.data = data;

            Core.notification('info', "Saving secret " + name);

            kubeClient.put($scope.secret,
              (data) => {
                var secretsLink = onSaveUrl || Developer.namespaceLink($scope, $routeParams, "secrets");
                var params = {};
                if (onSaveUrl) {
                  params['secret'] = name;
                }
                $location.path(secretsLink);
                $location.search(params);
                log.info("navigating to URL: " + secretsLink + " with params " + angular.toJson($location.search()));
              },
              (err) => {
                Core.notification('error', "Failed to secret " + name + "\n" + err);
              });
          }
        };

        updateData();

        function createProperty(key, text) {
          var label = secretLabels[key] || key.humanize();
          var tooltip = secretTooltips[key] || "Value of the " + label;

          var rows = 5;
          var lines = text.split("\n").length + 1;
          if (lines > rows) {
            rows = lines;
          }
          var type = "textarea";
          if (key === "username") {
            type = "text";
            if (!text) {
              text = currentUserName();
            }
          } else if (key === "password") {
            type = "password";
          }
          var property = {
            key: key,
            label: label,
            tooltip: tooltip,
            rows: rows,
            value: text,
            type: type
          };
          return property;
        }

        function updateData() {
          $scope.item = null;
          $scope.changed = false;
          $scope.entity = {
            name: $scope.id,
            properties: {}
          };
          if ($scope.id) {
            angular.forEach($scope.model.secrets, (secret) => {
              var name = getName(secret);
              if (name === $scope.id) {
                $scope.secret = secret;
                angular.forEach(secret.data, (value, key) => {
                  var text = "";
                  if (angular.isString(value) && value) {
                    text = value.decodeBase64();
                  }
                  var property = createProperty(key, text);
                  $scope.entity.properties[key] = property;
                });
                $scope.fetched = true;
                Core.$apply($scope);
              }
            });
          } else {
            if (createKind === "ssh") {
              $scope.addFields($scope.sshKeys);
            } else if (createKind === "https") {
              $scope.addFields($scope.httpsKeys);
            }
            $scope.fetched = true;
            Core.$apply($scope);
          }
        }
      }]);
}
