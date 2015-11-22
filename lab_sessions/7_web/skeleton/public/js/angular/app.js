'use strict';

var app = angular.module( "faketwitter", [
    'faketwitter.connection',	 
	'faketwitter.home'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/connection'});
}]);

app.run(function($rootScope, $http, $location, $window) {
    $rootScope.logout = function() {
        $http.get('/logout').
			success(function(data, status, headers, config) {
                delete $window.localStorage['username'];
			    $location.path('/connection');
			})
    };
	
    $rootScope.titleCLic = function() {
        event.preventDefault();
		if ($window.localStorage['username'] != undefined)
			$location.path('/home');
		else
			$location.path('/connection');
    };
	
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
         $http.get('/isConnected').
            success(function(data, status, headers, config) {
                if (data === 'false') {
                	$location.path('/connection');
                } else if ( next.controller == "connectionCtrl") {
        			$location.path('/home');
                }
            });
    });
});

/* My own directive use for tweet textarea count chars remaining etc. */ 
app.directive('myMaxlength', ['$compile', '$log', function($compile, $log) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            attrs.$set("ngTrim", "false");
            var maxlength = Number(attrs.myMaxlength);
            ctrl.$parsers.push(function (value) {
                if (value.length > maxlength)
                {
                    value = value.substr(0, maxlength);
                    ctrl.$setViewValue(value);
                    ctrl.$render();
                }
                if (value.length > 4)
                    scope.tweetIncomplete = false;
                if (value.length <= 4)
                    scope.tweetIncomplete = true;
                return value;
            });
        }
    };
}]);
