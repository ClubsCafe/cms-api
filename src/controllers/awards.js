/* eslint-disable no-underscore-dangle */
const { cloudinary } = require('../cloudinary');

const Event = require('../models/event');
const Award = require('../models/award');
const User = require('../models/user');
//  to get all the events of the organizations
//  a seperate get req will be made for all the events happening
module.exports.index = async (req, res) => {
  const currentEvent = Event.find({ eventId: req.params.eventId });
  const awards = await Award.find({ event: currentEvent._id });
  res.json({ success: true, awards });
};
module.exports.createAward = async (req, res) => {
  const event = Event.find({ eventId: req.params.eventId });
  const { title, points } = req.body.award;
  const award = new Event(title, points);
  if (req.file) {
    award.logo = {
      url: req.files.logo.path,
      filename: req.files.logo.filename,
    };
  }
  award.event = event._id;
  await award.save();
  event.awards.push(award._id);
  event.save();
  res.json({ success: true, award });
};

module.exports.showAward = async (req, res, next) => {
  const award = await Award.findById(req.params.awardId)
    .populate('event')
    .populate('winners');
  if (!award) {
    const err = { statusCode: 404, message: 'Award not found' };
    next(err);
  }
  res.json({ success: true, award });
};

module.exports.editAward = async (req, res, next) => {
  const award = await Award.findByIdAndUpdate(req.params.awardId, {
    ...req.body.award,
  });
  if (!award) {
    const err = { statusCode: 404, message: 'Award not found' };
    next(err);
  }
  if (req.file) {
    await cloudinary.uploader.destroy(award.logo.filename);
    award.logo = { url: req.file.path, filename: req.file.filename };
  }
  await award.save();
  res.json({ success: true, award });
};

module.exports.deleteAward = async (req, res, next) => {
  const award = await Award.findById(req.params.awardId);
  if (!award) {
    const err = { statusCode: 404, message: 'Award not found' };
    next(err);
  }
  await Event.findOneAndUpdate(
    { eventId: award.event },
    { $pull: { awards: award._Id } },
  );
  await User.updateMany({ $in: { awards: award._id } },
    {
      $pull: { awards: award._id },
      $inc: { points: -award.points },
    });
  await cloudinary.uploader.destroy(award.bannerImage.filename);
  await cloudinary.uploader.destroy(award.logo.filename);
  await Award.findByIdAndDelete(award._id);
  res.json({ success: true, message: 'Award deleted Successfuly' });
};

module.exports.giveAward = async (req, res, next) => {
  const { winners } = req.body;
  const award = Award.findById(req.params.awardId);
  if (!award) {
    const err = { statusCode: 404, message: 'Award not found' };
    next(err);
  }
  await User.updateMany(
    { $in: { username: winners } },
    {
      $push: { awards: req.params.awardId },
      $inc: { points: award.points },
    },
  );
  res.json({ success: true, message: 'Award added Successfully' });
};
