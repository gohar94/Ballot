'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Validation
 */
function validateLengthDescription (v) {
  // a custom validation function for checking string length to be used by the model
  return v.length <= 140;
}

function validateLengthOption (v) {
  // a custom validation function for checking string length to be used by the model
  return v.length <= 50;
}

/**
 * Poll Schema
 */
var PollSchema = new Schema({
  description: {
    type: String,
    default: '',
    required: 'Please fill description',
    validate: [validateLengthDescription, 'Description must be 140 characters or less'],
    trim: true,
    unique: true
  },
  optionA: {
    type: String,
    default: '',
    required: 'Please fill option A',
    validate: [validateLengthOption, 'Option A must be 50 characters or less'],
    trim: true
  },
  optionB: {
    type: String,
    default: '',
    required: 'Please fill option B',
    validate: [validateLengthOption, 'Option B must be 50 characters or less'],
    trim: true
  },
  optionAVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  optionBVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    enum: ['Politics', 'Sports', 'Food & Dining', 'Other'],
    default: 'Other',
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Poll', PollSchema);