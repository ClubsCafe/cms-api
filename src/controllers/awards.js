/* eslint-disable consistent-return */
const { cloudinary } = require('../services/cloudinary');

const Event = require('../models/event');
const Award = require('../models/award');
const User = require('../models/user');

//  to get all the events of the organizations
//  a seperate get req will be made for all the events happening
const { checkmod, checkeventmanager, checkeventmanager2 } = require('../middlewares/controllers/awards');
/*
Route fumctions
*/
/* GETS all the awards for a particular event */
module.exports.index = async (req, res) => {
  const currentEvent = Event.find({ eventId: req.params.eventId });
  const awards = await Award.find({ event: currentEvent._id });
  return res.json({ success: true, awards });
};
/* Creates a award for a particular event */
module.exports.createAward = async (req, res, next) => {
  await checkmod(req, next);
  await checkeventmanager(req, next);
  const event = Event.find({ eventId: req.params.eventId });
  const { title, points } = req.body;
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
  return res.json({ success: true, award });
};
/* shows a specific award details */
module.exports.showAward = async (req, res, next) => {
  const award = await Award.findById(req.params.awardId)
    .populate('event')
    .populate('winners');
  /* checks if the award exists */
  if (!award) {
    const err = { statusCode: 404, message: 'Award not found' };
    return next(err);
  }
  return res.json({ success: true, award });
};
/* for ediiting a specific award */
module.exports.editAward = async (req, res, next) => {
  await checkmod(req, next);
  await checkeventmanager2(req, next);
  const { title, points } = req.body;
  const award = await Award.findByIdAndUpdate(req.params.awardId, {
    title, points,
  });
  /* checks if the award exists */
  if (!award) {
    const err = { statusCode: 404, message: 'Award not found' };
    return next(err);
  }
  /* updating image(;ogo) file */
  if (req.file) {
    await cloudinary.uploader.destroy(award.logo.filename);
    award.logo = { url: req.file.path, filename: req.file.filename };
  }
  await award.save();
  return res.json({ success: true, award });
};

module.exports.deleteAward = async (req, res, next) => {
  await checkmod(req, next);
  await checkeventmanager2(req, next);
  const award = await Award.findById(req.params.awardId);
  /* checks if the award exists */
  if (!award) {
    const err = { statusCode: 404, message: 'Award not found' };
    return next(err);
  }
  /* removing the award from the specific event */
  await Event.findOneAndUpdate(
    { eventId: award.event },
    { $pull: { awards: award._id } },
  );
  /* removing the award and its points from the users */
  await User.updateMany({ $in: { awards: award._id } },
    {
      $pull: { awards: award._id },
      $inc: { points: -award.points },
    });
  /* deleting the respective image and the award. */
  await cloudinary.uploader.destroy(award.logo.filename);
  await Award.findByIdAndDelete(award._id);
  return res.json({ success: true, message: 'Award deleted Successfuly' });
};

module.exports.giveAward = async (req, res, next) => {
  await checkmod(req, next);
  await checkeventmanager2(req, next);
  const { winners } = req.body;
  const award = Award.findById(req.params.awardId);
  /* checks if the award exists */
  if (!award) {
    const err = { statusCode: 404, message: 'Award not found' };
    return next(err);
  }
  /* adding the award in the user and increasing the points according to the award */
  await User.updateMany(
    { $in: { username: winners } },
    {
      $push: { awards: req.params.awardId },
      $inc: { points: award.points },
    },
  );
  return res.json({ success: true, message: 'Award added Successfully' });
};
