var app = angular.module('flapperNews', [
    'ui.router',
    'flapperNews.controllers',
    'flapperNews.services'
]);

// Routing
app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('home', {
            url: '/home',
            templateUrl: '/javascripts/templates/homeView.html',
            controller: 'MainCtrl',
            resolve: {
                incidentPromise: ['incidents', function(incidents) {
                    return incidents.getAll();
                }]
            }
        });

        $stateProvider.state('login', {
            url: '/login',
            templateUrl: '/javascripts/templates/loginView.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth) {
                if (auth.isLoggedIn()) {
                    $state.go('home');
                }
            }]
        });

        $stateProvider.state('register', {
            url: '/register',
            templateUrl: '/javascripts/templates/registerView.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth) {
                if (auth.isLoggedIn()) {
                    $state.go('home');
                }
            }]
        });

        $stateProvider.state('incidents', {
            url:'/incidents/{id}',
            templateUrl: '/javascripts/templates/incidentView.html',
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

