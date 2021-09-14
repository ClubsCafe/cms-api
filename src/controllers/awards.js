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
  res.json(awards);
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
  res.redirect(
    `/organizations/${req.params.organizationId}/events/${event.eventId}/`,
  );
};

module.exports.showAward = async (req, res) => {
  const award = await Award.findById(req.params.awardId)
    .populate('event')
    .populate('winners');
  if (!award) {
    res.redirect(
      `/organizations/${req.params.awardId}/events/${req.params.eventId}`,
    );
  }
  res.json(award);
};

module.exports.editAward = async (req, res) => {
  const award = await Award.findByIdAndUpdate(req.params.awardId, {
    ...req.body.award,
  });
  if (req.file) {
    await cloudinary.uploader.destroy(award.logo.filename);
    award.logo = { url: req.file.path, filename: req.file.filename };
  }
  await award.save();
  res.redirect(
    `/organizations/${req.params.organizationId}/events/${req.params.eventId}/`,
  );
};

module.exports.deleteAward = async (req, res) => {
  const award = await Award.findById(req.params.awardId);
  await Event.findOneAndUpdate(
    { eventId: req.params.eventId },
    { $pull: { awards: award._Id } },
  );
  await User.updateMany({ $in: { awards: award._id } },
    { $pull: { awards: award._id }, $inc: { points: -award.points } });
  await cloudinary.uploader.destroy(award.bannerImage.filename);
  await cloudinary.uploader.destroy(award.logo.filename);
  await Award.findByIdAndDelete(award._id);
  res.redirect(
    `/organizations/${req.params.organizationId}/events/${req.params.eventId}/`,
  );
};

module.exports.giveAward = async (req, res) => {
  const { winners } = req.body;
  const award = Award.findById(req.params.awardId);
  await User.updateMany(
    { $in: { username: winners } },
    { $push: { awards: req.params.awardId }, $inc: { points: award.points } },
  );
  res.send('Success');
  res.redirect(
    `/organizations/${req.params.organizationId}/events/${req.params.eventId}/`,
  );
};
