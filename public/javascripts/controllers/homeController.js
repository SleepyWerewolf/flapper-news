angular.module('flapperNews.controllers').
controller('MainCtrl', [
    '$scope',
    'incidents',
    'auth',
    function($scope, incidents, auth) {
        $scope.test = 'Hello World!';
        $scope.incidents = incidents.incidents;
        $scope.isLoggedIn = auth.isLoggedIn;

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