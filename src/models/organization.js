/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const User = require('./user');
const Event = require('./event');
const Institute = require('./institute');
// for images aka- for cloudinary
const ImageSchema = new Schema({
  url: String,
  filename: String,
});

const OrganizationSchema = new Schema({
  // name of the organizer
  name: {
    type: String,
  },
  // unique organizer id
  organizationId: {
    type: String,
    unique: true,
    required: true,
  },
  bio: {
    type: String,
  },
  about: {
    type: String,
  },
  externalUrl: {
    type: String,
  },
  institute: {
    type: Schema.Types.ObjectId,
    ref: 'Institute',
  },
  // members of the organization who will handle events.
  eventmanagers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  // members of the organizers.
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  // banner image for the organization's profile
  bannerImage: ImageSchema,
  // logo of the organization
  logo: ImageSchema,
});

module.exports = mongoose.model('Organization', OrganizationSchema);
