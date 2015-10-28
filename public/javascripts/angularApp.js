var app = angular.module('flapperNews', ['ui.router']);

// Routing
app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'MainCtrl',
            resolve: {
                //postPromise: ['posts', function(posts) {
                //    return posts.getAll();
                //}]
                incidentPromise: ['incidents', function(incidents) {
                    return incidents.getAll();
                }]
            }
        });

        $stateProvider.state('posts', {
            url: '/posts/{id}',
            templateUrl: '/posts.html',
            controller: 'PostsCtrl',
            resolve: {
                post: [ '$stateParams', 'posts', function($stateParams, posts) {
                    return posts.get($stateParams.id);
                }]
            }  
        });

        $stateProvider.state('login', {
            url: '/login',
            templateUrl: '/login.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth) {
                if (auth.isLoggedIn()) {
                    $state.go('home');
                }
            }]
        });

        $stateProvider.state('register', {
            url: '/register',
            templateUrl: '/register.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth) {
                if (auth.isLoggedIn()) {
                    $state.go('home');
                }
            }]
        });

        $stateProvider.state('incidents', {
            url:'/incidents/{id}',
            templateUrl: '/incidents.html',
            controller: 'IncidentCtrl',
            resolve: {
                incident: [ '$stateParams', 'incidents', function($stateParams, incidents) {
                    return incidents.get($stateParams.id);
                }]
            }
        });

        $urlRouterProvider.otherwise('home');
    }
]);

// Controllers
app.controller('MainCtrl', [
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

app.controller('PostsCtrl', [
    '$scope',
    'posts',
    'post',
    'auth',
    function($scope, posts, post, auth) {
        $scope.post = post;
        $scope.posts = posts;
        $scope.isLoggedIn = auth.isLoggedIn;

        $scope.addComment = function() {
            if ($scope.body === '') return;
            posts.addComment(post._id, {
                body: $scope.body,
                author: 'user'
            }).success(function(comment) {
                $scope.post.comments.push(comment);
            });
            $scope.body = '';
        };

        $scope.incrementUpvotes = function(comment) {
            posts.upvoteComment(post, comment);
        };
    }
]);

app.controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth) {
        $scope.user = {};
        $scope.register = function() {
            auth.register($scope.user).error(function(error) {
                $scope.error = error;
            }).then(function() {
                $state.go('home');
            });
        };

        $scope.login = function() {
            auth.login($scope.user).error(function(error) {
                $scope.error = error;
            }).then(function() {
                $state.go('home');
            });
        }
    }
]);

app.controller('NavCtrl', [
    '$scope',
    'auth',
    function($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logout = auth.logout;
    }
]);

app.controller('IncidentCtrl', [
    '$scope',
    'incidents',
    'incident',
    'auth',
    function($scope, incidents, incident, auth) {
        $scope.incident = incident;
        $scope.incidents = incidents;
        $scope.isLoggedIn = auth.isLoggedIn;
    }
]);

// Models
app.factory('posts', [
    '$http',
    'auth',
    function($http, auth) {
        var o = {
            posts: []
        };

        o.get = function(id) {
            return $http.get('/posts/' + id).then(function(res) {
                return res.data;
            });
        };

        o.getAll = function() {
            return $http.get('/posts').success(function(data) {
                angular.copy(data, o.posts);
            });
        };

        o.create = function(post) {
          return $http.post('/posts', post, {
            headers: { Authorization: 'Bearer '+auth.getToken() }
          }).success(function(data){
            o.posts.push(data);
          });
        };

        o.upvote = function(post) {
          return $http.put('/posts/' + post._id + '/upvote', null, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
          }).success(function(data){
            post.upvotes++;
          });
        };

        o.addComment = function(id, comment) {
          return $http.post('/posts/' + id + '/comments', comment, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
          });
        };

        o.upvoteComment = function(post, comment) {
          return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote', null, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
          }).success(function(data){
            comment.upvotes++;
          });
        };

        return o;
    }
]);

app.factory('auth', [
    '$http',
    '$window',
    function ($http, $window) {
        var auth = {};
        auth.saveToken = function(token) {
            $window.localStorage['flapper-news-token'] = token;
        };
        auth.getToken = function() {
            return $window.localStorage['flapper-news-token'];
        };
        auth.isLoggedIn = function() {
            var token = auth.getToken();
            if (token) {
                var payload = JSON.parse($window.atob(token.split('.')[1]));
                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };
        auth.currentUser = function() {
            if (auth.isLoggedIn()) {
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));
                return payload.username;
            }
        };
        auth.register = function(user) {
            return $http.post('/register', user).success(function(data) {
                auth.saveToken(data.token);
            });
        };
        auth.login = function(user) {
            return $http.post('/login', user).success(function(data) {
                auth.saveToken(data.token);
            });
        };
        auth.logout = function() {
            $window.localStorage.removeItem('flapper-news-token');
        };
        return auth;
    }
]);

app.factory('incidents', [
    '$http',
    'auth',
    function($http, auth) {
        var o = {
            incidents: []
        };

        o.get = function(id) {
            return $http.get('/incidents/' + id).then(function(res) {
                return res.data;
            });
        };

        o.getAll = function() {
            return $http.get('/incidents').success(function(data) {
                angular.copy(data, o.incidents);
            });
        };

        o.create = function(post) {
          return $http.post('/incidents', post, {
            headers: { Authorization: 'Bearer '+auth.getToken() }
          }).success(function(data){
            o.incidents.push(data);
          });
        };

        return o;
    }
]);
