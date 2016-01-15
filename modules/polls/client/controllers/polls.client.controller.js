'use strict';

var pollsApp = angular.module('polls');

// Polls controller
pollsApp.controller('PollsController', ['$scope', '$stateParams','Authentication', 'Polls', '$modal', '$log', '$http',
  function ($scope, $stateParams, Authentication, Polls, $modal, $log, $http) {
    this.authentication = Authentication;
    this.animationsEnabled = true;

    // Find a list of Polls
    this.polls = Polls.query();

    // Open a modal for updating poll records
    this.modalViewDetails = function (size, selectedPoll) {
      var modalInstance = $modal.open({
        animation: this.animationsEnabled,
        templateUrl: 'modules/polls/client/views/edit-poll.client.view.html',
        controller: function ($scope, $modalInstance, poll) {
          $scope.poll = poll;
          $scope.ok = function () {
            $modalInstance.close($scope.poll);
          };

          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
        },
        size: size,
        resolve: {
          poll: function () {
            return selectedPoll;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

    this.vote = function (votePoll, voteOption) {
      $scope.error = null;
      
      $http.post('/api/polls/vote', { poll: votePoll, option: voteOption })
        .success(function(data) {
          $log.info('done');
        })
        .error(function(data) {
          $scope.error = data.message;
        });
    };
  }
]);

pollsApp.controller('PollsCreateController', ['$scope', 'Polls', '$log',
  function ($scope, Polls, $log) {
    // Create new Poll
    this.create = function (isValid) {
      $scope.error = null;
      $log.error("akaa");
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
        // Clear form fields
        $scope.description = '';
        $scope.optionA = '';
        $scope.optionB = '';
        $scope.category = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

pollsApp.controller('PollsUpdateController', ['$scope', 'Polls',
  function ($scope, Polls) {
    // Update existing Poll
    this.update = function (isValid, updatedPoll) {
      $scope.error = null;
      
      if (!isValid) { 
        $scope.$broadcast('show-errors-check-validity', 'pollUpdateForm');

        return false;
      }
      var poll = updatedPoll;

      poll.$update(function () {

      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

  //   // Remove existing Poll
  //   $scope.remove = function (poll) {
  //     if (poll) {
  //       poll.$remove();

  //       for (var i in $scope.polls) {
  //         if ($scope.polls[i] === poll) {
  //           $scope.polls.splice(i, 1);
  //         }
  //       }
  //     } else {
  //       $scope.poll.$remove(function () {
  //         $location.path('polls');
  //       });
  //     }
  //   };

  //   // Find existing Poll
  //   $scope.findOne = function () {
  //     $scope.poll = Polls.get({
  //       pollId: $stateParams.pollId
  //     });
  //   };
  // }
