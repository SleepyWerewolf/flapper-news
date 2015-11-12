angular.module('flapperNews.services').
factory('incidents', [
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