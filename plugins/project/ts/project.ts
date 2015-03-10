/// <reference path="../../includes.ts"/>
/// <reference path="projectHelpers.ts"/>
/// <reference path="projectPlugin.ts"/>

module Project {

  export var ProjectController = controller("ProjectController",
    ["$scope", "KubernetesModel", "$templateCache", "$location", "$routeParams", "$http", "$timeout", "KubernetesApiURL",
      ($scope, KubernetesModel:Kubernetes.KubernetesModelService,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, $timeout, KubernetesApiURL) => {

        $scope.model = KubernetesModel;

        $scope.entity = {
          name: ""
        };

        $scope.$on('$routeUpdate', ($event) => {
          updateData();
        });

        // TODO add actual login/pwd or OAuth
        var authorizationHeader = "Basic TODO";

        // TODO take this from the service host!
        $scope.create = () => {
          var url = gogsUserRepoRestURL;

          console.log("Creating project " + angular.toJson($scope.entity, true));
          console.log("Posting to url: " + url);

          var data = $scope.entity;
          var config = {
            headers: {
              'withCredentials': true,
              'Authorization': authorizationHeader,
              'Content-Type': "application/json"
            }
          };
          $http.post(url, data, config).
            success(function (data, status, headers, config) {
              console.log("project created! got data " + angular.toJson(data, true));

              createProject(data);
            }).
            error(function (data, status, headers, config) {
              log.warn("Failed to load " + url + " " + data + " " + status);
              Core.notification('error', "Failed to create git repository " + name + ". Returned code: " + status + " " + data);
            });
        };

        updateData();

        function createProject(data) {
          var full_name = data.full_name;
          if (full_name) {
            var gitUrl = Core.url(gogsRestURL + "/" + full_name + ".git");
            console.log("Creating a git repo for " + full_name + " at : " + gitUrl);

          }
          // TODO lets forward to the create project wizard...
        }

        function updateData() {
          $scope.builds = [];
          var url = gogsUserRepoRestURL;
          var config = {
            headers: {
              'withCredentials': true,
              'Authorization': authorizationHeader
            }
          };
          delete $http.defaults.headers.common["Accept"];
          $http.get(url, config).
            success(function (data, status, headers, config) {
              if (data) {
                console.log("got repos: " + angular.toJson(data, true));
                $scope.builds = data;
              }
              $scope.fetched = true;
              Core.$apply($scope);
            }).
            error(function (data, status, headers, config) {
              $scope.fetched = true;
              log.warn("Failed to load " + url + " " + data + " " + status);
            });
        }
      }]);
}
