'use strict';

var app = angular.module('polls');

// Polls controller
app.controller('PollsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Polls', '$http', '$log', 'Notify',
  function ($scope, $stateParams, $location, Authentication, Polls, $http, $log, Notify) {
    $scope.authentication = Authentication;
    $scope.errorDiv = null;
    $scope.filterExpression = { 'username' : '' };
    $scope.showingMyPolls = false;
    $scope.showingAllPolls = true;

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
          // all good here, notifying the view
          console.log(voteOption);
          Notify.sendMsg('NewVote', { 'option': voteOption });
        })
        .error(function(data) {
          $scope.errorDiv = votePoll._id;
          $scope.error = data.message;
        });
    };

    $scope.filterMyPolls = function (username) {
      $scope.filterExpression = { 'username' : username };
      Notify.sendMsg('ShowMyPolls');
    };

    $scope.showAllPolls = function () {
      $scope.filterExpression = { 'username' : '' };
      Notify.sendMsg('ShowAllPolls');
    };
  }
]);

app.directive('pollList', ['Polls', 'Notify', function(Polls, Notify) {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'modules/polls/client/views/poll-list-template.html',
    link: function (scope, element, attrs) {
      // When someone votes, update it on the poll list
      Notify.getMsg('NewVote', function(event, data) {
        scope.polls = Polls.query();
      });
      Notify.getMsg('ShowAllPolls', function(event, data) {
        scope.showingAllPolls = true;
        scope.showingMyPolls = false;
      });
      Notify.getMsg('ShowMyPolls', function(event, data) {
        scope.showingAllPolls = false;
        scope.showingMyPolls = true;
      });
    }
  };
}]);