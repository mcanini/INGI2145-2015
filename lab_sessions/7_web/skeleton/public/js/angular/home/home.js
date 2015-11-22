angular.module('faketwitter.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: '/home',
    controller: 'homeCtrl'
  });
}])

.controller(
"homeCtrl",
function($scope, $http, $rootScope, $location, $window, Twitter) {

});