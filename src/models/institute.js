/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const User = require('./user');
const Organization = require('./organization');
// for images aka- for cloudinary
const ImageSchema = new Schema({
  url: String,
  filename: String,
});

const InstituteSchema = new Schema({
  // name of the organizer
  name: {
    type: String,
  },
  // unique organizer id
  instituteId: {
    type: String,
    unique: true,
    maxlength: 8,
    required: true,
  },
  about: {
    type: String,
  },
  externalUrl: {
    type: String,
  },
  emailRegex: {
    type: String,
    required: true,
  },
  // members of the organization who will handle events.
  mods: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  organizations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
  ],
  // members of the organizers.
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  //  banner image for the organization's profile
  bannerImage: ImageSchema,
  //  logo of the organization
  logo: ImageSchema,
});

module.exports = mongoose.model('Institute', InstituteSchema);
