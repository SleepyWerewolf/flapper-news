angular.module('flapperNews.controllers').
controller('MainCtrl', [
    '$scope',
    'posts',
    'incidents',
    'auth',
    function($scope, posts, incidents, auth) {
        $scope.test = 'Hello World!';
        $scope.posts = posts.posts;
        $scope.incidents = incidents.incidents;
        $scope.isLoggedIn = auth.isLoggedIn;

        $scope.addPost = function(){
          if(!$scope.title || $scope.title === '') { return; }
          posts.create({
            title: $scope.title,
            link: $scope.link,
          });
          $scope.title = '';
          $scope.link = '';
        };

        $scope.incrementUpvotes = function(post) {
            posts.upvote(post);
        };

        $scope.addIncident = function() {
            if (!$scope.building_type || $scope.building_type === '' || !$scope.address | $scope.address === '') return;
            incidents.create({
                building_type: $scope.building_type,
                address: $scope.address,
            });
            $scope.building_type = '';
            $scope.address = '';
        };
    }
]);