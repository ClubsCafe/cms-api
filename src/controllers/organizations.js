/* eslint-disable no-underscore-dangle */
const { cloudinary } = require('../cloudinary');

const Event = require('../models/event');
const Organization = require('../models/organization');
const User = require('../models/user');

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
  const organization = new Organization({
    name,
    organizationId,
    bio,
    about,
    externalUrl,
  });
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

module.exports.showOrganization = async (req, res) => {
  const organization = await Organization.findOne({
    organizationId: req.params.organizationId,
  })
    .populate('members')
    .populate('eventmanagers');
  if (!organization) {
    res.redirect('/organizations/');
  }
  const activeEvents = await Event.find({
    organization: organization._id,
    completed: false,
  });
  const completedEvents = await Event.find({
    organization: organization._id,
    completed: true,
  });
  res.json({ organization, activeEvents, completedEvents });
};

module.exports.editOrganization = async (req, res) => {
  const organization = await Organization.findOneAndUpdate(
    { organizationId: req.params.organizationId },
    { ...req.body.organization },
  );
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
  res.redirect(`/organizations/${req.params.organizationId}`);
};

/* To add event managers, you need to be a mod */
module.exports.addEventManager = async (req, res) => {
  const organization = await Organization.findOne({
    organizationId: req.params.organizationId,
  });
  const user = await User.findOne({ username: req.body.username });
  const { userType } = user;
  if (
    userType === 'admin'
    || userType === 'mod'
    || (userType === 'eventmanager')
  ) {
    user.organization.push(organization._id);
    organization.eventmanagers.push(user._id);
    await user.save();
    await organization.save();
    res.send('success');
  } else {
    res.send("the requested user isn't a eventmanager. upgrade his previleges");
  }
};

module.exports.addMember = async (req, res) => {
  const organization = await Organization.findOne({
    organizationId: req.params.organizationId,
  });
  const user = await User.findOne({ username: req.body.username });
  user.organization.push(organization._id);
  organization.eventmanagers.push(user._id);
  await user.save();
  await organization.save();
  res.send('success');
};

module.exports.deleteOrganization = async (req, res) => {
  const organization = await Organization.find({
    eventId: req.params.organizationId,
  });
  /* Will not be deleting events so that events occured or awards
   given stay. */
  await cloudinary.uploader.destroy(organization.bannerImage.filename);
  await cloudinary.uploader.destroy(organization.logo.filename);
  await organization.findByIdAndDelete(organization._id);
  res.redirect('/organizations/');
};

/* add/remove members function to be added yet, */
