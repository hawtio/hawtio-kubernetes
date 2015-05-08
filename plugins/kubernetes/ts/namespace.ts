/// <reference path="kubernetesPlugin.ts"/>
module Kubernetes {
	
	export var NamespaceController = controller("NamespaceController", ["$scope", "WatcherService", ($scope, watcher:WatcherService) => {
		$scope.watcher = watcher;
		$scope.namespaceObjects = watcher.getObjects('namespaces');
		$scope.namespace = watcher.getNamespace();
		$scope.namespaces = [];
		$scope.$watch('namespace', (newValue, oldValue) => {
			if (newValue !== oldValue) {
				watcher.setNamespace(newValue);
			}
		});
		$scope.$watch('watcher.getNamespace()', (newValue, oldValue) => {
			if (newValue !== oldValue) {
				$scope.namespace = newValue;
			}
		});
		$scope.$watchCollection('namespaceObjects', (namespaceObjects) => {
			$scope.namespaces = _.map(namespaceObjects, (namespace:any) => namespace.metadata.name);
		})		
	}]);
	
}