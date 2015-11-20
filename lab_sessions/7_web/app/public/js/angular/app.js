'use strict';

var app = angular.module( "faketwitter", [	 
	'faketwitter.connection',
    'faketwitter.profile',
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


/* Repeated functions declared once in this module */
app.factory('Twitter', function ($location, $http) {
    function Factory (scope) {
        this.sendTweet = function() {
            scope.sendTweetButton = false;
            $http({
                method: 'POST',
                url: '/newTweet',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded',
                           'xsrfCookieName': ''},
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {tweet: scope.tweet_content, imageId: scope.imageId}
            }).success(function (data, status, headers, config) {
                scope.sendTweetButton = true;
                scope.tweetSent = true;
                scope.tweetIncomplete = true;
                scope.tweet_content = "";
                scope.imageId = null;
                scope.uploading = false;
                scope.uploadComplete = true;
            });
        };

        /** Upload a file via XHR */ 
        this.sendImage = function(ev) {
            var pbar = $(".progressbar");
            function upload_error(ev) {
                scope.uploading = false;
                scope.uploadComplete = false;
                scope.uploadError = true;
                scope.$apply();
            }
            function upload_started(ev) {
                scope.tweetSent = false;
                pbar.attr("value", 0);
                scope.uploadError = false;
                scope.uploading = true;
                scope.uploadComplete = false;
                scope.$apply();
            }
            function upload_progress(ev) {
                pbar.attr("value", (ev.loaded / ev.total));
                scope.$apply();              
            }
            function upload_completed(ev) {
                var result = $.parseJSON(ev.target.response);
                scope.imageId = result.id;
                pbar.attr("value", 1.0);
                scope.uploading = true;
                scope.uploadComplete = true;
                scope.$apply();
            }
            var srcElement = ev.srcElement? ev.srcElement : ev.target; 
            var file = typeof srcElement.files == "object" 
                    && srcElement.files.length > 0 ? srcElement.files[0] : false;
            if(!!file) {
                // only accecpt png or jpg
                if( file.type != 'image/jpeg'
                    && file.type != 'image/jpg'
                    && file.type != 'image/png') {
                        scope.uploading = false;
                        scope.uploadComplete = false;
                        scope.uploadError = true;
                        scope.errorMessage = 'File format not supported,'
                                            + ' only png or jpg are allowed';
                        scope.$apply();
                }
                else if (file.size > 1000000) {//Max soze 1Mb 
                    scope.uploading = false;
                    scope.uploadComplete = false;
                    scope.uploadError = true;
                    scope.errorMessage = 'The file is too large (max. 1MB)';
                    scope.$apply();
                } else {
                    // configure form data
                    var form_data = new FormData();
                    form_data.append("file_input", file);
                    // create XMLHttpRequest
                    var xhr = new XMLHttpRequest();
                    // bind progress event
                    xhr.upload.addEventListener("progress", upload_progress, false);
                    // open request
                    xhr.open("POST", "/image/upload", true);
                    // bind events
                    xhr.onload = upload_completed;
                    xhr.onerror = upload_error;
                    // send file
                    xhr.send(form_data);
                    // execute upload start method
                    upload_started();
                }
            }
        };

        this.profile = function(username) {
            $location.path('/usr/'+username);
        };

        return this;
    }

    return Factory;
});
