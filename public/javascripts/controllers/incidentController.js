angular.module('flapperNews.controllers').
controller('IncidentCtrl', [
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