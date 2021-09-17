/* eslint-disable no-underscore-dangle */
const { cloudinary } = require('../services/cloudinary');

const Institute = require('../models/institute');
const Event = require('../models/event');
const User = require('../models/user');

/* to get all the events of the organizations  a
seperate get req will be made for all the events happening */
module.exports.index = async (req, res) => {
  const institutes = await Institute.find({});
  res.json({ success: true, institutes });
};
module.exports.createInstitute = async (req, res) => {
  const {
    name, instituteId, about, externalUrl,
  } = req.body.institute;
  const institute = new Institute({
    name,
    instituteId,
    about,
    externalUrl,
  });
  if (req.files.logo[0]) {
    institute.logo = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  if (req.files.bannerImage[0]) {
    institute.bannerImage = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  await institute.save();
  res.json({ success: true, institute });
};

module.exports.showInstitute = async (req, res, next) => {
  const institute = await Institute.findOne({
    instituteId: req.params.instituteId,
  })
    .populate('members')
    .populate('mods')
    .populate('organizations');
  if (!institute) {
    const err = { statusCode: 404, message: 'InstituteNotFound' };
    next(err);
  }
  const activeEvents = await Event.find({
    institute: institute._id,
    completed: false,
  });
  const completedEvents = await Event.find({
    institute: institute._id,
    completed: true,
  });
  res.json({
    success: true, institute, activeEvents, completedEvents,
  });
};

module.exports.editInstitute = async (req, res) => {
  const institute = await Institute.findOneAndUpdate(
    { instituteId: req.params.instituteId },
    { ...req.body.institute },
  );
  if (req.files.logo[0]) {
    await cloudinary.uploader.destroy(institute.logo.filename);
    institute.logo = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  if (req.files.bannerImage[0]) {
    await cloudinary.uploader.destroy(institute.bannerImage.filename);
    institute.bannerImage = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  await institute.save();
  res.redirect({
    success: true,
    message: 'Institute details Updated Successfully',
    institute,
  });
};

/* To add event managers, you need to be a mod */
module.exports.addMod = async (req, res, next) => {
  const institute = await Institute.findOne({
    instituteId: req.params.instituteId,
  });
  const user = await User.findOne({ username: req.body.username });
  const { userType } = user;
  if (
    userType === 'admin'
    || userType === 'mod') {
    institute.mods.push(user._id);
    await institute.save();
    res.json({
      success: true,
      institute,
    });
  } else {
    const err = {
      statusCode: 400,
      message: 'The User doesn\'t have minimum previleges to become a mod',
    };
    next(err);
  }
};

module.exports.addMember = async (req, res) => {
  const institute = await Institute.findOne({
    instituteId: req.params.instituteId,
  });
  const user = await User.findOne({ username: req.body.username });
  user.institute = institute._id;
  institute.members.push(user._id);
  await user.save();
  await institute.save();
  res.json({
    success: true,
    message: 'member added successfully to the institute',
  });
};

module.exports.deleteInstitute = async (req, res) => {
  const institute = await Institute.find({
    eventId: req.params.instituteId,
  });
  /* Will not be deleting events so that events occured or awards
   given stay. */
  await cloudinary.uploader.destroy(institute.bannerImage.filename);
  await cloudinary.uploader.destroy(institute.logo.filename);
  await Institute.findByIdAndDelete(institute._id);
  res.json({
    success: true,
    message: 'Institute has successfully be deleted',
  });
};

/* add/remove members function to be added yet, */
