'use strict';

// Polls controller
angular.module('polls').controller('PollsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Polls', '$http', '$log',
  function ($scope, $stateParams, $location, Authentication, Polls, $http, $log) {
    $scope.authentication = Authentication;

    // Create new Poll
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'pollForm');

        return false;
      }

      // Create new Poll object
      var poll = new Polls({
        description: this.description,
        optionA: this.optionA,
        optionB: this.optionB,
        category: this.category
      });

      // Redirect after save
      poll.$save(function (response) {
        $location.path('polls/' + response._id);

        // Clear form fields
        $scope.description = '';
        $scope.optionA = '';
        $scope.optionB = '';
        $scope.category = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Poll
    $scope.remove = function (poll) {
      if (poll) {
        poll.$remove();

        for (var i in $scope.polls) {
          if ($scope.polls[i] === poll) {
            $scope.polls.splice(i, 1);
          }
        }
      } else {
        $scope.poll.$remove(function () {
          $location.path('polls');
        });
      }
    };

    // Update existing Poll
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'pollForm');

        return false;
      }

      var poll = $scope.poll;

      poll.$update(function () {
        $location.path('polls/' + poll._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Polls
    $scope.find = function () {
      $scope.polls = Polls.query();
    };

    // Find existing Poll
    $scope.findOne = function () {
      $scope.poll = Polls.get({
        pollId: $stateParams.pollId
      });
    };

    $scope.vote = function (votePoll, voteOption) {
      $http.post('/api/polls/vote', { poll: votePoll, option: voteOption })
        .success(function(data) {
          // all good here
        })
        .error(function(data) {
          $scope.error = data.message;
        });
    };
  }
]);