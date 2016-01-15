'use strict';

// Setting up route
angular.module('polls').config(['$stateProvider',
  function ($stateProvider) {
    // polls state routing
    $stateProvider
      .state('polls', {
        abstract: true,
        url: '/polls',
        template: '<ui-view/>'
      })
      .state('polls.list', {
        url: '',
        templateUrl: 'modules/polls/client/views/list-polls.client.view.html'
      });
  }
]);
