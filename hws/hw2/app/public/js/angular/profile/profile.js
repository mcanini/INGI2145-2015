angular.module('faketwitter.profile', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/usr/:username', {
    templateUrl: '/usr',
    controller: 'profileCtrl'
  });
}])

.controller(
"profileCtrl",
function($scope, $http, $rootScope, $routeParams, $location, Twitter) {
    var Twitter = new Twitter($scope);
    $scope.send_tweet = Twitter.sendTweet;
    $scope.profile = Twitter.profile;

    $scope.notReady = true;
	$routeParams.username;

    $scope.styleFeed = {'font-weight': "bold"};
    $scope.styleFollowers = {};
    $scope.styleFollowing = {};
    $scope.followTab = false;
    $scope.feed = true;

    $scope.errorMessage = "";
    $scope.uploadComplete = true;
    $scope.uploadError = false;
    $scope.uploading = false;
    $scope.imageId = null;
    $("#file-input").change(Twitter.sendImage);

	$http.get('/usr/' + $routeParams.username).
        success(function(data, status, headers, config) {
        	$scope.following = data.isFollowing;
            $scope.username = data.fullname;
            $scope.notReady = false;
        });

    $scope.tab = function(tab) {
        $http.get('/usr/' + $routeParams.username + "/" + tab).
            success(function(data) {
                if (tab == 'followers') {
                    $scope.followers = data;
                    $scope.styleFeed = {};
                    $scope.styleFollowers = {'font-weight': "bold"};
                    $scope.styleFollowing = {};
                    $scope.followTab = true;
                    $scope.feed = false;
                }
                else if (tab == 'following') {
                    $scope.followers = data;
                    $scope.styleFeed = {};
                    $scope.styleFollowers = {};
                    $scope.styleFollowing = {'font-weight': "bold"};
                    $scope.followTab = true;
                    $scope.feed = false;
                }
                else {
                    $scope.tweets = data;
                    angular.forEach ($scope.tweets, function (tweet, key) {
                        var date = new Date(tweet.created_at);
                        if (date != 'undefined')
                          tweet.display_time =  date.getDate() + " /" + 
                                                (date.getMonth() + 1) + "/" + date.getFullYear() + 
                                                ' at ' + date.getHours() + ':' + date.getMinutes();
                    });
                    $scope.styleFeed = {'font-weight': "bold"};
                    $scope.styleFollowers = {};
                    $scope.styleFollowing = {};
                    $scope.followTab = false;
                    $scope.feed = true;
                }

            });
    }

	$scope.follow = function() {
		follow_or_unfollow = "/follow";
		if ($scope.following) {
			follow_or_unfollow = "/unfollow";
		}
		$http.get('/usr/' + $routeParams.username + follow_or_unfollow).
            success(function(data, status, headers, config) {
            	$scope.following = !$scope.following;
            });
	};

    $scope.tab("feed");
});
