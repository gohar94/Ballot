  'use strict';

  angular.module('polls')

  //Polls service used for communicating with the polls REST endpoints
  .factory('Polls', ['$resource', function ($resource) {
    return $resource('api/polls/:pollId', { pollId: '@_id' }, { update: { method: 'PUT' } });
  }
  ])

  .factory('Notify', ['$rootScope', function ($rootScope) {
    var notify = {};
    
    notify.sendMsg = function(msg, data) {
      data = data || {};
      $rootScope.$emit(msg, data);
    };

    notify.getMsg = function(msg, func, scope) {
      var unbind = $rootScope.$on(msg, func);
      if (scope) {
        scope.$on('destroy', unbind);
      }
    };

    return notify;
  }
  ]);