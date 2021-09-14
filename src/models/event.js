/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const Award = require('./award');
const Organization = require('./organization');
const User = require('./user');

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

const EventSchema = new Schema({
  //    Name of The event
  name: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
    unique: true,
  },
  externalUrl: {
    type: String,
  },
  tags: [
    {
      type: String,
    },
  ],
  bio: {
    type: String,
    maxlength: 180,
  },
  // details of the event
  about: {
    type: String,
    required: true,
  },
  // Start of the event
  startDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  endDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  // Event Organizer
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  // winner of the event
  awards: {
    type: Schema.Types.ObjectId,
    ref: 'Award',
  },
  // banner image for the event
  bannerImage: ImageSchema,
  // logo for the event
  logo: ImageSchema,
});
/* will be made such that if there doesn't exist a logo or
 banner then the organizations will be used or a option
  will be given or it will be made compulsary. */
module.exports = mongoose.model('Event', EventSchema);
