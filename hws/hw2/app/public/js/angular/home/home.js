angular.module('faketwitter.home', ['ngRoute', 'infinite-scroll'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: '/home',
    controller: 'homeCtrl'
  });
}])

.controller(
"homeCtrl",
function($scope, $http, $rootScope, $location, $window, Twitter) {
	var MTwitter = new Twitter($scope);
	$scope.send_tweet = MTwitter.sendTweet;
	$scope.profile = MTwitter.profile;
	$scope.tweetIncomplete = true;

    $scope.errorMessage = "";
    $scope.uploadComplete = true;
    $scope.uploadError = false;
    $scope.uploading = false;
    $scope.imageId = null;
    $("#file-input").change(MTwitter.sendImage);

	$scope.feedTitle = $window.localStorage.getItem('username');

	$scope.tweets = [];
    $scope.fullLoaded = false;
    $scope.loading = false; 
    $scope.getTweets = function() {
        if (!$scope.fullLoaded && !$scope.loading) {
            $scope.loading = true; 
        	$http.get('/newsFeed/' + $scope.tweets.length).
                success(function(data, status, headers, config) {
                	$scope.tweets = $scope.tweets.concat(data);
                    if (data.length == 0)
                        $scope.fullLoaded = true;
                	angular.forEach ($scope.tweets, function (tweet, key) {
                        var date = new Date(tweet.created_at);
                        if (date != 'undefined')
                		  tweet.display_time =  date.getDate() + " /" + 
                                                (date.getMonth() + 1) + "/" + date.getFullYear() + 
                                                ' at ' + date.getHours() + ':' + date.getMinutes();
                	});
                    $scope.loading = false; 
                });
        }
    };
	$scope.sendTweetButton = true;

});