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

        var kubeClient = $scope.client = K8SClientFactory.create("secrets", Kubernetes.currentKubernetesNamespace());

        $scope.$on('kubernetesModelUpdated', function () {
          if ($scope.id && !$scope.secret) {
            updateData();
          }
        });

        $scope.$on('$routeUpdate', ($event) => {
          updateData();
        });

        $scope.checkFieldExists = (key) => {
          return $scope.entity.properties[key];
        }

        $scope.entityChanged = () => {
          $scope.changed = true;
        };

        $scope.addDataField = () => {
          var key = $scope.entity.newDataKey;
          if (key) {
            var property = createProperty(key, "");
            $scope.entity.properties[key] = property;
            $scope.entity.newDataKey = "";
            $scope.showAddDataFieldForm = false;
            $scope.entityChanged();
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
              var value = property.value;
              if (key && value) {
                data[key] = value.encodeBase64();
              }
            });
            $scope.secret.metadata.name = name;
            $scope.secret.data = data;

            Core.notification('info', "Saving secret " + name);

            kubeClient.put($scope.secret,
              (data) => {
                var secretsLink = Developer.namespaceLink($scope, $routeParams, "secrets");
                $location.path(secretsLink);
              },
              (err) => {
                Core.notification('error', "Failed to secret " + name + "\n" + err);
              });
          }
        };

        var secretLabels = {
          "ssh-key": "SSH private key",
          "ssh-key.pub": "SSH public key",
          "ca.crt": "CA Certificate",
          ".dockercfg": "Docker config"
        };
        var secretTooltips = {
          "ssh-key": "SSH private key text contents",
          "ca.crt": "Certificate Authority (CA) Certificate",
          ".dockercfg": "Docker configuration token"
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
          var property = {
            key: key,
            label: label,
            tooltip: tooltip,
            rows: rows,
            value: text
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
            $scope.fetched = true;
            Core.$apply($scope);
          }
        }
      }]);
}
