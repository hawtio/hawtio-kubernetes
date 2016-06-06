/// <reference path="../../includes.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  // Controller that handles a service that requires an OAuth redirect
  _module.controller("Kubernetes.PostController", ($scope, userDetails, $element, $sce) => {
    var service = $scope.$eval('view.service');
    if (!service || !service.$connectTemplate) {
      return;
    }
    // need to clear off any query params
    var actionUrl = new URI(service.$actionUrl);
    actionUrl.query({});
    var connectUrl = new URI(service.$connectUrl);
    connectUrl.query({});
    connectUrl.hash('#' + URI.encode('{"backTo":"' + new URI().toString() + '"}'));
    var item = {
      '$host': service.$host,
      '$actionUrl': $sce.trustAsResourceUrl(actionUrl.toString()),
      '$connectUrl': $sce.trustAsResourceUrl(connectUrl.toString())
    }
    $scope.item = item;
    $scope.accessToken = userDetails.token;
    $scope.go = () => {
      var form = $element.find('form');
      form.submit();
    }

  });

  _module.controller("Kubernetes.TermController", ($scope, TerminalService) => {
    $scope.canConnectTo = (container) => {
      if (container.securityContext && container.securityContext.privileged) {
        return false;
      }
      return true;
    }
    $scope.openTerminal = (selfLink, containerName) => {
      var id = TerminalService.newTerminal(selfLink, containerName);
      log.debug("Created terminal, id: ", id);
    }
  });

  // controller that deals with the labels per pod
  export var Labels = controller("Labels", ["$scope", "$location", ($scope, $location) => {
    $scope.labels = [];
    var labelKeyWeights = {
      "name": 1,
      "replicationController": 2,
      "group": 3
    };
    $scope.$watch('entity', (newValue, oldValue) => {
      if (newValue) {
        // log.debug("labels: ", newValue);
        // massage the labels a bit
        $scope.labels = [];
        angular.forEach(Core.pathGet($scope.entity, ["metadata", "labels"]), (value, key) => {
          if (key === 'fabric8') {
            // TODO not sure what this is for, the container type?
            return;
          }
          $scope.labels.push({
            key: key,
            title: value
          });
        });

        //  lets sort by key but lets make sure that we weight certain labels so they are first
        $scope.labels = $scope.labels.sort((a, b) => {
          function getWeight(key) {
            return labelKeyWeights[key] || 1000;
          }
          var n1 = a["key"];
          var n2 = b["key"];
          var w1 = getWeight(n1);
          var w2 = getWeight(n2);
          var diff = w1 - w2;
          if (diff < 0) {
            return -1;
          } else if (diff > 0) {
            return 1;
          }
          if (n1 && n2) {
            if (n1 > n2) {
              return 1;
            } else if (n1 < n2) {
              return -1;
            } else {
              return 0;
            }
          } else {
            if (n1 === n2) {
              return 0;
            } else if (n1) {
              return 1;
            } else {
              return -1;
            }
          }
        });
      }
    });

    $scope.handleClick = (entity, labelType:string, value) => {
      // log.debug("handleClick, entity: ", entity, " key: ", labelType, " value: ", value);
      var filterTextSection = labelType + "=" + value.title;
      $scope.$emit('labelFilterUpdate', filterTextSection);
    };

    $scope.labelClass = containerLabelClass;
  }]);

}
