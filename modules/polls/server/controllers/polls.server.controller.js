'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Poll = mongoose.model('Poll'),
  PollVoter = mongoose.model('PollVoter'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a poll
 */
exports.create = function (req, res) {
  var poll = new Poll(req.body);
  poll.user = req.user;

  poll.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(poll);
    }
  });
};

/**
 * Show the current poll
 */
exports.read = function (req, res) {
  res.json(req.poll);
};

/**
 * Update a poll
 */
exports.update = function (req, res) {
  var poll = req.poll;
  // TODO think about if all these things should be editable

  poll.description = req.body.description;
  
  if (poll.optionA !== req.body.optionA) {
    poll.optionAVotes = 0;
  }
  if (poll.optionB !== req.body.optionB) {
    poll.optionBVotes = 0;
  }
  poll.optionA = req.body.optionA;
  poll.optionB = req.body.optionB;
  poll.category = req.body.category;

  poll.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(poll);
    }
  });
};

/**
 * Vote in a poll
 */
exports.vote = function (req, res) {
  var option = req.body.option;
  var poll = req.body.poll;
  console.log("thiss");
  console.log(poll._id);

  // // See if this user has already voted
  if (!mongoose.Types.ObjectId.isValid(poll._id)) {
    return res.status(400).send({
      message: 'Poll is invalid'
    });
  }
  
  Poll.findOne(poll._id).exec(function (err, _pollReal) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (!_pollReal) {
      console.log("no poll found");
      return res.status(400).send({
        message: 'No poll with that identifier has been found'
      });
    } else {
      console.log("found poll");
      PollVoter.findOne({ poll: _pollReal, voter: req.use r}).exec(function (err1, _pollVoter) {
        if (err) {
          console.log(err1);
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else if (!_pollVoter) {
          console.log("poll voter not there, making");
          var pollVoter = new PollVoter();
          pollVoter.voter = req.user;
          pollVoter.poll = _pollReal;
          pollVoter.option = option;
          pollVoter.save(function (err) {
            if (err) {
              console.log(err);
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              if (String(option) === String('A')) {
                Poll.findOneAndUpdate({ _id: poll._id }, { $inc: { optionAVotes: 1 } }).exec(function (err, _poll) {
                  if (err) {
                    console.log(err);
                    return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                  } else {
                    res.json(pollVoter);
                  }
                });
              } else {
                Poll.findOneAndUpdate({ _id: poll._id }, { $inc: { optionBVotes: 1 } }).exec(function (err, _poll) {
                  if (err) {
                    console.log(err);
                    return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                  } else {
                    res.json(pollVoter);
                  }
                });
              }
            }
          });
        } else {
          res.json(_pollVoter);
        }
      });
    }
  });
};

/**
 * Delete an poll
 */
exports.delete = function (req, res) {
  var poll = req.poll;

  poll.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(poll);
    }
  });
};

/**
 * List of Polls
 */
exports.list = function (req, res) {
  Poll.find().sort('-created').populate('user', 'displayName').exec(function (err, polls) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(polls);
    }
  });
};

/**
 * Poll middleware
 */
exports.pollByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Poll is invalid'
    });
  }

  PollVoter.find(id).populate('user', 'displayName').exec(function (err, poll) {
    if (err) {
      return next(err);
    } else if (!poll) {
      return res.status(404).send({
        message: 'No poll with that identifier has been found'
      });
    }
    req.poll = poll;
    next();
  });
};
