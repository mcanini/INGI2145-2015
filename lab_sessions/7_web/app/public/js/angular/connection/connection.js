angular.module('faketwitter.connection', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/connection', {
    templateUrl: '/connection',
    controller: 'connectionCtrl'
  });
}])

.controller(
"connectionCtrl",
function($scope, $http, $location, $rootScope, $window) {
	// VAR INIT
	$scope.username = '';
	$scope.fullname = '';
	$scope.pass = '';
	$scope.passC = '';

	$scope.error_fullname = false;
	$scope.error_username = false;
	$scope.error_pass = false;
	$scope.error_passC = false;
	$scope.error_server = "";
	$scope.error_server_happened = false;

	$scope.incomplete = true; 
	$scope.isSubscribing = false;
	$scope.justSubscribed = false;

	// EVENT
	$scope.registration = function(id) {
		$scope.incomplete = true; 
		$scope.isSubscribing = true;
		$scope.error_server_happened = false;
		$scope.error_fullname = false;
		$scope.error_username = false;
		$scope.error_pass = false;
		$scope.error_passC = false;
		$scope.username = '';
		$scope.fullname = '';
		$scope.pass = '';
		$scope.passC = '';
	};	


	// FORM TEST FUNCTIONS
	$scope.testUsername = function() {
		if ($scope.username.length > 20 || $scope.username.length < 4  || !$scope.username.match("^([-_A-z0-9]){3,}$")) {
			$scope.error_username = true;
		} else {
			$scope.error_username = false;
			$scope.test();
		}
	};

	$scope.testFullname = function() {
		if ($scope.fullname.length > 20 || $scope.fullname.length < 4 || !$scope.fullname.match("^([- _A-z0-9]){3,}$")) {
	    	$scope.error_fullname = true;
	    } else {
			$scope.error_fullname = false;
			$scope.test();
		}
	};

	$scope.testPassword = function() {
		if ($scope.pass.length > 20 || $scope.pass.length < 4) {
	    	$scope.error_pass = true;
	    } else {
			$scope.error_pass = false;
			$scope.test();
		}
		if ($scope.isSubscribing) {
			if ($scope.pass !== $scope.passC
				&& $scope.passC.length <= 20 && $scope.passC.length >= 4) {
				$scope.error_passC = true;
			} else {
				$scope.error_passC = false;
				$scope.test();
			}
		}
	};

	$scope.testPasswordC = function() {
		if ($scope.pass !== $scope.passC) {
			$scope.error_passC = true;
		} else {
			$scope.error_passC = false;
			$scope.test();
		}
	};

	$scope.test = function() {
		if ($scope.isSubscribing) {
			$scope.error_server_happened = false;
			if (	$scope.pass === $scope.passC
					&& $scope.username.length <= 20 && $scope.username.length >= 4  && $scope.username.match("^([-_A-z0-9]){3,}$")
					&& $scope.fullname.length <= 20 && $scope.fullname.length >= 4 && $scope.fullname.match("^([- _A-z0-9]){3,}$")
				    && $scope.pass.length <= 20 && $scope.pass.length >= 4) {
		   		$scope.incomplete = false;
			}
		} else {
			if (	$scope.username.length <= 20 && $scope.username.length >= 4  && $scope.username.match("^([-_A-z0-9]){3,}$")
			 		&& $scope.pass.length <= 20 && $scope.pass.length >= 4) {
		   		$scope.incomplete = false;
			}
		}
	};


	// POST REQUESTS
	$scope.signin = function() {
		$http({
		    method: 'POST',
		    url: '/validate',
		    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		    transformRequest: function(obj) {
		        var str = [];
		        for(var p in obj)
		        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		        return str.join("&");
		    },
		    data: {username: $scope.username, pass: $scope.pass}
		}).success(function (data) {
			$window.localStorage['username'] =  $scope.username;
			$location.path('/home');
		}).error(function(data, status, headers, config) {
			$scope.error_server = data;
			delete sessionStorage.token;
			$scope.error_server_happened = true;
		});
	};

	$scope.register = function() {
		$http({
		    method: 'POST',
		    url: '/validateSubscription',
		    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		    transformRequest: function(obj) {
		        var str = [];
		        for(var p in obj)
		        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		        return str.join("&");
		    },
		    data: {username: $scope.username, fullname: $scope.fullname, pass: $scope.pass}
		}).success(function () {
			$scope.isSubscribing = false;
			$scope.complete = false;
			$scope.username = '';
			$scope.fullname = '';
			$scope.pass = '';
			$scope.passC = '';
			$scope.servError = false;
			$scope.justSubscribed = true;
		}).error(function(data, status, headers, config) {
			$scope.error_server = data;
			$scope.error_server_happened = true;
		});
	};
	$scope.test();
});