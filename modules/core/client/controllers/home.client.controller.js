'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$location',
  function ($scope, Authentication, $location) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    if ($scope.authentication.user) {
      $location.path('/polls');
    }
  }
]);
