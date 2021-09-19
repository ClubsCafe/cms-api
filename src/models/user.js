/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

const { Schema } = mongoose;

// requiring other schemas (awards and events here)
const Event = require('./event');
const Award = require('./award');
const Organization = require('./organization');
const Institute = require('./institute');
/* yet to be created */
const ImageSchema = new Schema({
  url: String,
  filename: String,
});

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email cannot be Empty'],
      unique: true,
    },
    userType: {
      type: String,
      required: true,
      enum: ['admin', 'eventmanager', 'mod', 'user'],
      default: 'user',
    }, /*      eventmanager can create events or we can make it such that
     any normal user can create events but a mod has to accept those events */
    dob: {
      type: Date,
      default: Date.now,
    },
    name: {
      type: String,
      required: [true, 'Name cannot be Empty'],
    },
    username: {
      type: String,
      required: [true, 'Username cannot be Empty'],
      unique: true,
    },
    // basically the bio of a typical sodial media or a short description of themselves
    bio: {
      type: String,
    },
    about: {
      type: String,
    },
    awards: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Award',
      },
    ],
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
    // points system to consider ranking
    points: {
      type: Number,
      default: 0,
    },
    // to specify which organizations one belongs to, could be multiple,
    institute: {
      type: Schema.Types.ObjectId,
      ref: 'Institute',
    },
    organizations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
      },
    ],
    avatar: ImageSchema, // for avatars or so called profile pictures
  },
  { timestamps: true },
); // for knowing the date of creationg

module.exports = mongoose.model('User', UserSchema);
