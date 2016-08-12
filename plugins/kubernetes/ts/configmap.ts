/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var PodController = controller("ConfigMapController",
    ["$scope", "KubernetesModel", "KubernetesState", "ServiceRegistry", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "$window", "KubernetesApiURL",
      ($scope, KubernetesModel: Kubernetes.KubernetesModelService, KubernetesState, ServiceRegistry,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, $window, KubernetesApiURL) => {

    $scope.kubernetes = KubernetesState;
    $scope.model = KubernetesModel;
    $scope.rawModel = null;
    $scope.formConfig = null;
    $scope.newSettings = null;
    $scope.form = null;
    $scope.entity = null;

    $scope.$on('hawtio-form2-form', (event, data) => {
      if (data.name === "configMapConfig") {
        $scope.form = data.form;
      }
    });

    Kubernetes.initShared($scope, $location, $http, $timeout, $routeParams, KubernetesModel, KubernetesState, KubernetesApiURL);

    $scope.$on('kubernetesModelUpdated', function () {
      updateData();
    });

    $scope.$on('$routeUpdate', ($event) => {
      updateData();
    });

    $scope.$watch('model.configmaps', (newValue, oldValue) => {
      updateData();
    }, true);

    $scope.$on('kubernetesObjectSaved', ($event, obj) => {
      log.debug("Object saved: ", obj);
      var path = $location.path();
      path = path.replace('/newConfigMap', '/' + obj.metadata.name);
      $location.path(path);
      Core.$apply($scope);
    });

    $scope.flipRaw = () => {
      $scope.rawMode = !$scope.rawMode;
      Core.$apply($scope);
    };
    
    $scope.flipReadOnly = () => {
      $scope.readOnly = !$scope.readOnly;
      Core.$apply($scope);
    };

    $scope.saveForm = () => {
      if (!$scope.formConfig) {
        return;
      }
      var item = $scope.item;
      var entity = $scope.entity;
      _.forOwn($scope.formConfig.properties, (value, key) => {
        var dataProp = key.toLowerCase().replace(/_/g, '-');
        item.data[dataProp] = entity[key];
      });
      $scope.save(item, false);
    }

    $scope.$on('kubernetesObjectSaved', (event, obj) => {
      console.log("Form: ", $scope.form);
      if ($scope.form) {
        $scope.form.$setPristine();
      }
      console.log("Saved object: ", obj);
    });

    updateData();

    function updateData() {
      $scope.id = $routeParams["id"];
      var item:any = null;
      var rawModel:any = null;
      var formConfig:any = null;
      var description:string = null;
      var name:string = null;
      var entity:any = null;
      if ($scope.id === 'newConfigMap') {
        item = {
          kind: 'ConfigMap',
          apiVersion: 'v1',
          metadata: {
            name: 'New Config Map',
            namespace: $scope.model.currentNamespace(),
            labels: {}
          },
          data: {}
        }
        $scope.readOnly = false;
      } else {
        item = _.find($scope.model.configmaps, (configmap) => $scope.id === KubernetesAPI.getName(configmap));
      }
      if (item) {
        name = <string>_.get(item, 'metadata.name');
        // yaml
        rawModel = toRawYaml($scope.item);
        //check for form configuration
        var annotations = _.get(item, 'metadata.annotations');
        if (annotations) {
          description = annotations['description'];
          formConfig = annotations['fabric8.io/json-schema'];
          if (formConfig) {
            try {
              formConfig = angular.fromJson(formConfig);
              $scope.rawMode = false;
              entity = {};
              _.forOwn(formConfig.properties, (value, key) => {
                var dataProp = key.toLowerCase().replace(/_/g, '-');
                entity[key] = item.data[dataProp];
                // log.debug('entity[' + key + '] = item.data[' + dataProp + '] = ' + entity[key]);
              });
            } catch (err) {
              log.warn("Failed to decode form config: ", err);
              formConfig = null;
            }
          }
        }
      }
      $scope.item = item;
      $scope.rawModel = rawModel;
      $scope.formConfig = formConfig;
      $scope.description = description;
      $scope.name = name;
      $scope.entity = entity;
      Core.$apply($scope);
    }
  }]);
}
