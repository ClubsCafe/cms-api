const mongoose = require('mongoose');

const { Schema } = mongoose;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

const AwardSchema = new Schema({
  title: {
    type: String,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
  },
  /* can be also reffered to as badge, will be of low pixels so that
   idk we can set an virtual for reduced sizes. :) */
  logo: ImageSchema,
  // points for the specifc award
  points: {
    type: Number,
    min: 0,
    default: 0,
  },
  // people who have the award
  winners: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

module.exports = mongoose.model('Award', AwardSchema);
