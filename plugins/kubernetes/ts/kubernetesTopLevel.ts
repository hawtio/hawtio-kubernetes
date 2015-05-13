/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var FileDropController = controller("FileDropController", ["$scope", "jolokiaUrl", "jolokia", "FileUploader", ($scope, jolokiaUrl, jolokia:Jolokia.IJolokia, FileUploader) => {

      $scope.uploader = <FileUpload.FileUploader> new FileUploader(<FileUpload.IOptions>{
        autoUpload: true,
        removeAfterUpload: true,
        url: jolokiaUrl
      });

      FileUpload.useJolokiaTransport($scope, $scope.uploader, jolokia, (json) => {
        log.debug("Json: ", json);
        return {
          'type': 'exec',
          mbean: Kubernetes.managerMBean,
          operation: 'apply',
          arguments: [json]
        };
      });

      $scope.uploader.onBeforeItem = (item) => {
        Core.notification('info', 'Uploading ' + item);
      };

      $scope.uploader.onSuccessItem = (item:FileUpload.IFileItem) => {
        log.debug("onSuccessItem: ", item);
      };

      $scope.uploader.onErrorItem = (item, response, status) => {
        log.debug("Failed to apply, response: ", response, " status: ", status);
      }

  }]);
	
	export var NamespaceController = controller('NamespaceController', ['$scope', 'WatcherService', ($scope, watcher:WatcherService) => {
		$scope.namespaces = watcher.getObjects('namespaces');
		$scope.$watchCollection('namespaces', (newValue, oldValue) => {
			if (newValue !== oldValue) {
				$scope.namespace = watcher.getNamespace();
			}
		});
		$scope.$watch('namespace', (newValue, oldValue) => {
			if (newValue !== oldValue) {
				if (newValue !== oldValue) {
					watcher.setNamespace(newValue);
				}
			}
		});
	}]);

  export var TopLevel = controller("TopLevel", ["$scope", "workspace", "KubernetesVersion", "KubernetesState", ($scope, workspace:Core.Workspace, KubernetesVersion:ng.IPromise<ng.resource.IResourceClass>, KubernetesState) => {

    $scope.version = undefined;

    $scope.showAppView = isAppView(workspace);

    $scope.isActive = (href) => {
      return workspace.isLinkActive(href);
    };

    $scope.kubernetes = KubernetesState;

    KubernetesVersion.then((KubernetesVersion:ng.resource.IResourceClass) => {
      KubernetesVersion.query((response) => {
        $scope.version = response;
      });
    });

  }]);

}
