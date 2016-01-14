'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Poll = mongoose.model('Poll'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, poll;

/**
 * Poll routes tests
 */
describe('Poll CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new poll
    user.save(function () {
      poll = {
        title: 'Poll Title',
        content: 'Poll Content'
      };

      done();
    });
  });

  it('should be able to save an poll if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new poll
        agent.post('/api/polls')
          .send(poll)
          .expect(200)
          .end(function (pollSaveErr, pollSaveRes) {
            // Handle poll save error
            if (pollSaveErr) {
              return done(pollSaveErr);
            }

            // Get a list of polls
            agent.get('/api/polls')
              .end(function (pollsGetErr, pollsGetRes) {
                // Handle poll save error
                if (pollsGetErr) {
                  return done(pollsGetErr);
                }

                // Get polls list
                var polls = pollsGetRes.body;

                // Set assertions
                (polls[0].user._id).should.equal(userId);
                (polls[0].title).should.match('Poll Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an poll if not logged in', function (done) {
    agent.post('/api/polls')
      .send(poll)
      .expect(403)
      .end(function (pollSaveErr, pollSaveRes) {
        // Call the assertion callback
        done(pollSaveErr);
      });
  });

  it('should not be able to save an poll if no title is provided', function (done) {
    // Invalidate title field
    poll.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new poll
        agent.post('/api/polls')
          .send(poll)
          .expect(400)
          .end(function (pollSaveErr, pollSaveRes) {
            // Set message assertion
            (pollSaveRes.body.message).should.match('Title cannot be blank');

            // Handle poll save error
            done(pollSaveErr);
          });
      });
  });

  it('should be able to update an poll if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new poll
        agent.post('/api/polls')
          .send(poll)
          .expect(200)
          .end(function (pollSaveErr, pollSaveRes) {
            // Handle poll save error
            if (pollSaveErr) {
              return done(pollSaveErr);
            }

            // Update poll title
            poll.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing poll
            agent.put('/api/polls/' + pollSaveRes.body._id)
              .send(poll)
              .expect(200)
              .end(function (pollUpdateErr, pollUpdateRes) {
                // Handle poll update error
                if (pollUpdateErr) {
                  return done(pollUpdateErr);
                }

                // Set assertions
                (pollUpdateRes.body._id).should.equal(pollSaveRes.body._id);
                (pollUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of polls if not signed in', function (done) {
    // Create new poll model instance
    var pollObj = new Poll(poll);

    // Save the poll
    pollObj.save(function () {
      // Request polls
      request(app).get('/api/polls')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single poll if not signed in', function (done) {
    // Create new poll model instance
    var pollObj = new Poll(poll);

    // Save the poll
    pollObj.save(function () {
      request(app).get('/api/polls/' + pollObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', poll.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single poll with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/polls/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Poll is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single poll which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent poll
    request(app).get('/api/polls/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No poll with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an poll if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new poll
        agent.post('/api/polls')
          .send(poll)
          .expect(200)
          .end(function (pollSaveErr, pollSaveRes) {
            // Handle poll save error
            if (pollSaveErr) {
              return done(pollSaveErr);
            }

            // Delete an existing poll
            agent.delete('/api/polls/' + pollSaveRes.body._id)
              .send(poll)
              .expect(200)
              .end(function (pollDeleteErr, pollDeleteRes) {
                // Handle poll error error
                if (pollDeleteErr) {
                  return done(pollDeleteErr);
                }

                // Set assertions
                (pollDeleteRes.body._id).should.equal(pollSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an poll if not signed in', function (done) {
    // Set poll user
    poll.user = user;

    // Create new poll model instance
    var pollObj = new Poll(poll);

    // Save the poll
    pollObj.save(function () {
      // Try deleting poll
      request(app).delete('/api/polls/' + pollObj._id)
        .expect(403)
        .end(function (pollDeleteErr, pollDeleteRes) {
          // Set message assertion
          (pollDeleteRes.body.message).should.match('User is not authorized');

          // Handle poll error error
          done(pollDeleteErr);
        });

    });
  });

  it('should be able to get a single poll that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new poll
          agent.post('/api/polls')
            .send(poll)
            .expect(200)
            .end(function (pollSaveErr, pollSaveRes) {
              // Handle poll save error
              if (pollSaveErr) {
                return done(pollSaveErr);
              }

              // Set assertions on new poll
              (pollSaveRes.body.title).should.equal(poll.title);
              should.exist(pollSaveRes.body.user);
              should.equal(pollSaveRes.body.user._id, orphanId);

              // force the poll to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the poll
                    agent.get('/api/polls/' + pollSaveRes.body._id)
                      .expect(200)
                      .end(function (pollInfoErr, pollInfoRes) {
                        // Handle poll error
                        if (pollInfoErr) {
                          return done(pollInfoErr);
                        }

                        // Set assertions
                        (pollInfoRes.body._id).should.equal(pollSaveRes.body._id);
                        (pollInfoRes.body.title).should.equal(poll.title);
                        should.equal(pollInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Poll.remove().exec(done);
    });
  });
});
