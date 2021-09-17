/* eslint-disable no-underscore-dangle */
const { cloudinary } = require('../services/cloudinary');

const Event = require('../models/event');
const Organization = require('../models/organization');
const User = require('../models/user');
const Institute = require('../models/institute');
/* to get all the events of the organizations  a
seperate get req will be made for all the events happening */
module.exports.index = async (req, res) => {
  const organizations = await Organization.find({});
  res.json(organizations);
};

module.exports.createOrganization = async (req, res) => {
  const {
    name, organizationId, externalUrl, about, bio,
  } = req.body.organization;
  const institute = await Institute.find({ instituteId: req.params.instituteId });
  const organization = new Organization({
    name,
    organizationId,
    bio,
    about,
    externalUrl,
  });
  organization.institute = institute._id;
  if (req.files.logo[0]) {
    organization.logo = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  if (req.files.bannerImage[0]) {
    organization.bannerImage = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  await organization.save();
  res.send(organization);
};

module.exports.showOrganization = async (req, res, next) => {
  const organization = await Organization.findOne({
    organizationId: req.params.organizationId,
  })
    .populate('institute')
    .populate('members')
    .populate('eventmanagers');
  if (!organization) {
    const err = { statusCode: 404, message: 'Organization Not Found' };
    next(err);
  }
  const activeEvents = await Event.find({
    organization: organization._id,
    completed: false,
  });
  const completedEvents = await Event.find({
    organization: organization._id,
    completed: true,
  });
  res.json({
    success: true, organization, activeEvents, completedEvents,
  });
};

module.exports.editOrganization = async (req, res, next) => {
  const organization = await Organization.findOneAndUpdate(
    { organizationId: req.params.organizationId },
    { ...req.body.organization },
  );
  if (!organization) {
    const err = { statusCode: 404, message: 'Organization not found' };
    next(err);
  }
  if (req.files.logo[0]) {
    await cloudinary.uploader.destroy(organization.logo.filename);
    organization.logo = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  if (req.files.bannerImage[0]) {
    await cloudinary.uploader.destroy(organization.bannerImage.filename);
    organization.bannerImage = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  await organization.save();
  res.json({ success: true, organization });
};

/* To add event managers, you need to be a mod */
module.exports.addEventManager = async (req, res, next) => {
  const user = await User.findOne({ username: req.body.username });
  const organization = await Organization.findOne({
    organizationId: req.params.organizationId,
    $in: {
      members: user._id,
    },
  });
  if (!organization) {
    const err = {
      statusCode: 403,
      message: 'Organization not found or the user is not a member of the organization',
    };
    next(err);
  }
  if (!user) {
    const err = { statusCode: 404, message: 'User not found' };
    next(err);
  }
  const { userType } = user;
  if (
    userType === 'admin'
    || userType === 'mod'
    || (userType === 'eventmanager')
  ) {
    organization.eventmanagers.push(user._id);
    await user.save();
    await organization.save();
    res.json();
  } else {
    const err = {
      statusCode: 400,
      message: 'The User doesn\'t have minimum previleges to become a EventManager',
    };
    next(err);
  }
};

module.exports.addMember = async (req, res, next) => {
  const organization = await Organization.findOne({
    organizationId: req.params.organizationId,
  }).populate('institute');
  const user = await User.findOne({ username: req.body.username }).populate('institute');
  if (!user) {
    const err = { statusCode: 404, message: 'User not found' };
    next(err);
  }
  if (user.institute !== organization.institute) {
    const err = { statusCode: 403, message: 'User is not a member of the institute' };
    next(err);
  }
  user.organization.push(organization._id);
  organization.members.push(user._id);
  await user.save();
  await organization.save();
  res.json({ success: true, user, organization });
};

module.exports.deleteOrganization = async (req, res) => {
  const organization = await Organization.find({
    eventId: req.params.organizationId,
  });
  await cloudinary.uploader.destroy(organization.bannerImage.filename);
  await cloudinary.uploader.destroy(organization.logo.filename);
  await organization.findByIdAndDelete(organization._id);
  res.json({ success: true, message: 'Organization deleted Successfully' });
};

/* add/remove members function to be added yet, */
