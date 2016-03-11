/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="kubernetesModel.ts"/>
module Kubernetes {

  export var FileDropController = controller("FileDropController", ["$scope", "KubernetesModel", "FileUploader", '$http', ($scope, model:KubernetesModelService, FileUploader, $http:ng.IHttpService) => {

      var uploader = $scope.uploader = <FileUpload.FileUploader> new FileUploader(<FileUpload.IOptions>{
        autoUpload: false,
        removeAfterUpload: true,
        url: kubernetesApiUrl()
      });

      $scope.uploader.onAfterAddingFile = (file) => {
        var reader = new FileReader();
        reader.onload = () => {
          if (reader.readyState === 2) {
            log.debug("File added: ", file);        
            var json = reader.result;
            var obj = null;
            try {
              obj = angular.fromJson(json);
            } catch (err) {
              log.debug("Failed to read dropped file ", file._file.name, ": ", err);
              return;
            }
            log.debug("Dropped object: ", obj);
            if (!KubernetesAPI.getNamespace(obj)) {
              obj.metadata.namespace = model.currentNamespace();
            }
            KubernetesAPI.put({
              object: obj,
              success: (data) => {
                Core.notification("success", "Applied " + file._file.name);
              },
              error: (err) => {
                log.info("Got error applying", file._file.name, ": ", err);
                Core.notification("warning", "Failed to apply " + file._file.name + ", error: " + err.message);
              }
            });
          }
        }
        reader.readAsText(file._file);
      };

      $scope.uploader.onBeforeUploadItem = (item) => {
        log.debug("Uploading: ", item);
        //Core.notification('info', 'Uploading ' + item);
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

  export var TopLevel = controller("TopLevel", ["$scope", "KubernetesVersion", "KubernetesState", ($scope, KubernetesVersion:ng.resource.IResourceClass<any>, KubernetesState) => {

    $scope.version = undefined;

    $scope.showAppView = isAppView();

    $scope.isActive = (href) => {
      return isLinkActive(href);
    };

    $scope.kubernetes = KubernetesState;

    KubernetesVersion.query((response) => {
      $scope.version = response;
    });

  }]);

}
