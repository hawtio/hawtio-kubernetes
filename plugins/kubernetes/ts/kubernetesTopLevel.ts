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

      /*
      FileUpload.useJolokiaTransport($scope, $scope.uploader, jolokia, (json) => {
        log.debug("Json: ", json);
        return {
          'type': 'exec',
          mbean: Kubernetes.managerMBean,
          operation: 'apply',
          arguments: [json]
        };
      });
      */
      
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
            log.debug("obj: ", obj);
            var kind:string = obj.kind.toLowerCase().pluralize();
            // little tweak, as we use replicationControllers locally
            if (kind !== 'replicationcontrollers' && !(kind in model)) {
              log.debug("Kind ", kind, " not found in model");
              return;
            }
            var localList = model[kind];
            if (kind === 'replicationcontrollers') {
              localList = model['replicationControllers'];
            }
            var name:string = obj.metadata.name;
            var url = UrlHelpers.join(kubernetesApiUrl(), kubernetesNamespacePath(), kind);
            var method = 'POST';
            if (_.any(localList, (obj:any) => obj.metadata.name === name)) {
              method = 'PUT';
              url = UrlHelpers.join(url, name);
            }
            log.debug("url: ", url);
            $http({
              url: url,
              method: method,
              data: obj
            }).success((response) => {
              log.debug("got back response: ", response);
            }).error((response) => {
              log.debug("got back error: ", response);
            })
            //uploader.uploadItem(file);
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

  export var TopLevel = controller("TopLevel", ["$scope", "workspace", "KubernetesVersion", "KubernetesState", ($scope, workspace:Core.Workspace, KubernetesVersion:ng.resource.IResourceClass, KubernetesState) => {

    $scope.version = undefined;

    $scope.showAppView = isAppView(workspace);

    $scope.isActive = (href) => {
      return workspace.isLinkActive(href);
    };

    $scope.kubernetes = KubernetesState;

    KubernetesVersion.query((response) => {
      $scope.version = response;
    });

  }]);

}
