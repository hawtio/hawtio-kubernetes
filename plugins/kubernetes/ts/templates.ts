/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {
  export var TemplateController = controller("TemplateController", ["$scope", "KubernetesModel", "$location", "marked", ($scope, KubernetesModel, $location, marked) => {
    $scope.model = KubernetesModel;
    $scope.filterText = "";

    function getAnnotations(obj) {
      return Core.pathGet(obj, ['metadata', 'annotations']);
    }

    function getKeyFor(obj, key) {
      var annotations = getAnnotations(obj);
      if (!annotations) {
        return "";
      }
      return _.find(_.keys(annotations), (k) => _.endsWith(k, key));
    }

    $scope.cancel = () => $location.path('/kubernetes/apps');

    $scope.filterTemplates = (template) => {
      if (Core.isBlank($scope.filterText)) {
        return true;
      }
      return _.contains(angular.toJson(template), $scope.filterText.toLowerCase());
    }

    $scope.getDescription = (template) => {
      return marked(Core.pathGet(template, ['metadata', 'annotations', getKeyFor(template, 'description')]) || 'No description');
    }

    $scope.getIconUrl = (template) => {
      return Core.pathGet(template, ['metadata', 'annotations', getKeyFor(template, 'iconUrl')]) || defaultIconUrl;
    }

    $scope.deployTemplate = (template) => {
      log.debug("I don't work yet");
    }

    $scope.deleteTemplate = (template) => {
      UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
        collection: [template],
        index: 'metadata.name',
        onClose: (result:boolean) => {
          if (result) {
            KubernetesModel['templatesResource'].delete({
              id: template.metadata.name
            }, undefined, () => {
              KubernetesModel['templatesResource'].query((data) => {
                KubernetesModel.templates = data.items;
              });
            }, (error) => {
              log.debug("Error deleting template: ", error); 
            });
          }
        },
        title: 'Delete Template?',
        action: 'The following template will be deleted:',
        okText: 'Delete',
        okClass: 'btn-danger',
        custom: "This operation is permanent once completed!",
        customClass: "alert alert-warning"
      }).open();
    }

  }]);
}

