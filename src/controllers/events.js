/* eslint-disable no-underscore-dangle */
const { cloudinary } = require('../services/cloudinary');

const Event = require('../models/event');
const Organization = require('../models/organization');
const Award = require('../models/award');
const User = require('../models/user');
const Institute = require('../models/institute');
/*  to get all the events of the organizations  a
 seperate get req will be made for all the events happening */

module.exports.organizationIndex = async (req, res) => {
  const currentOrganization = await Organization.findOne({
    organizationId: req.params.organizationId,
  });
  const activeEvents = await Event.find({
    organization: currentOrganization._id,
    active: true,
  });
  const completedEvents = await Event.find({
    organization: currentOrganization._id,
    active: false,
  });
  return res.json({
    success: true,
    activeEvents,
    completedEvents,
  });
};

module.exports.index = async (req, res) => {
  const activeEvents = await Event.find({
    active: true,
  });
  const completedEvents = await Event.find({
    active: false,
  });
  return res.json({
    success: true,
    activeEvents,
    completedEvents,
  });
};
module.exports.createEvent = async (req, res, next) => {
  if (req.user.userType === 'mod') {
    const instituteCount = await Institute.count(
      {
        instituteId: req.params.instituteId,
        $in: { mods: req.user._id },
      },
    );
    if (!instituteCount) {
      const err = {
        statusCode: 404,
        message: 'Institute Not Found or the current user is not a mod of the institute',
      };
      return next(err);
    }
  }
  if (req.user.userType === 'eventmanager') {
    const organizationCount = await Organization.count(
      {
        organizationId: req.params.organizationId,
        $in: { eventmanagers: req.user._id },
      },
    );
    if (!organizationCount) {
      const err = {
        statusCode: 404,
        message: 'Organization Not Found or the current user is not a mod of the Organization',
      };
      return next(err);
    }
  }
  const organization = await Organization.findOne({
    organizationId: req.params.organizationId,
  });
  const institute = await Institute.findOne({ instituteId: req.params.instituteId });
  if (organization.institute !== institute._id) {
    const err = {
      statusCode: 403,
      message: 'Organization does not belong to the Institute.',
    };
    return next(err);
  }
  const {
    name,
    eventId,
    externalUrl,
    tags,
    bio,
    about,
    startDate,
    endDate,
    active,
  } = req.body.event;
  const event = new Event({
    name,
    eventId,
    externalUrl,
    tags,
    bio,
    about,
    startDate,
    endDate,
    active,
  });
  if (req.files.logo[0]) {
    event.logo = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  if (req.files.bannerImage[0]) {
    event.bannerImage = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  event.organization = organization._id;
  event.institute = institute._id;
  await event.save();
  organization.events.push(event._id);
  await organization.save();
  return res.json({ success: true, event });
};

module.exports.showEvent = async (req, res, next) => {
  const event = await Event.findOne({ eventId: req.params.eventId }).populate(
    'organization',
  );
  /* populate other according to needs */
  if (!event) {
    const err = {
      statusCode: 404,
      message: 'event not found',
    };
    next(err);
    // res.redirect(`/organizations/${req.params.organizationId}/`)
  }
  return res.json({ success: true, event });
};

module.exports.editEvent = async (req, res, next) => {
  if (req.user.userType === 'mod') {
    const instituteCount = await Institute.count(
      {
        instituteId: req.params.instituteId,
        $in: { mods: req.user._id },
      },
    );
    if (!instituteCount) {
      const err = {
        statusCode: 404,
        message: 'Institute Not Found or the current user is not a mod of the institute',
      };
      return next(err);
    }
  }
  if (req.user.userType === 'eventmanager') {
    const organizationCount = await Organization.count(
      {
        organizationId: req.params.organizationId,
        $in: { eventmanagers: req.user._id },
      },
    );
    if (!organizationCount) {
      const err = {
        statusCode: 404,
        message: 'Organization Not Found or the current user is not a mod of the Organization',
      };
      return next(err);
    }
  }
  const organization = await Organization.findOne(
    { organizationId: req.params.organizationId },
  );
  if (!organization) {
    const err = {
      statusCode: 404,
      message: 'Organization not found',
    };
    return next(err);
  }
  const institute = await Institute.findOne(
    { instituteId: req.params.instituteId },
  );
  if (organization.institute !== institute._id) {
    const err = {
      statusCode: 403,
      message: 'Organization does not belong to the Institute.',
    };
    return next(err);
  }
  let event = await Event.findOne(
    { eventId: req.params.eventId },
  );
  if (!event) {
    const err = {
      statusCode: 404,
      message: 'Event not found',
    };
    return next(err);
  }
  if (event.organization !== organization._id) {
    const err = {
      statusCode: 403,
      message: 'event does not belong to the organization.',
    };
    return next(err);
  }
  const {
    name, eventId, externalUrl, tags,
    bio, about, startDate, endDate, active,
  } = req.body.events;
  event = await Event.findOneAndUpdate({ eventId: req.params.eventId }, {
    name,
    eventId,
    externalUrl,
    tags,
    bio,
    about,
    startDate,
    endDate,
    active,
  },
  { new: true });
  if (req.files.logo[0]) {
    await cloudinary.uploader.destroy(event.logo.filename);
    event.logo = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  if (req.files.bannerImage[0]) {
    await cloudinary.uploader.destroy(event.bannerImage.filename);
    event.bannerImage = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  await event.save();
  return res.json({ success: true, event });
};

module.exports.deleteEvent = async (req, res, next) => {
  if (req.user.userType === 'mod') {
    const instituteCount = await Institute.count(
      {
        instituteId: req.params.instituteId,
        $in: { mods: req.user._id },
      },
    );
    if (!instituteCount) {
      const err = {
        statusCode: 404,
        message: 'Institute Not Found or the current user is not a mod of the institute',
      };
      return next(err);
    }
  }
  if (req.user.userType === 'eventmanager') {
    const organizationCount = await Organization.count(
      {
        organizationId: req.params.organizationId,
        $in: { eventmanagers: req.user._id },
      },
    );
    if (!organizationCount) {
      const err = {
        statusCode: 404,
        message: 'Organization Not Found or the current user is not a mod of the Organization',
      };
      return next(err);
    }
  }
  const event = await Event.findOne({ eventId: req.params.eventId });
  if (!event) {
    const err = {
      statusCode: 404,
      message: 'Event not found',
    };
    return next(err);
  }
  await Organization.findByIdAndUpdate(event.Organization, {
    $pull: { events: event._id },
  });

  /* Award deletion commands here */
  await User.updateMany({}, { $pull: { awards: event.awards } });
  await Award.deleteMany({ $in: { _id: event.awards } });
  await cloudinary.uploader.destroy(event.bannerImage.filename);
  await cloudinary.uploader.destroy(event.logo.filename);
  await event.findByIdAndDelete(event._id);
  return res.json({
    success: true,
    message: 'Event Deleted Successfully',
  });
};

module.exports.register = async (req, res, next) => {
  const event = await Event.findOne({ eventId: req.params.eventId });
  if (!event) {
    const err = {
      statusCode: 404,
      message: 'Event not found',
    };
    return next(err);
  }
  if (!event.active) {
    const err = {
      statusCode: 403,
      message: 'Event is not active',
    };
    return next(err);
  }
  event.participants.push(req.user._id);
  await event.save();
  const user = User.findById(req.user._id);
  user.events.push(event._id);
  await user.save();
  return res.json({
    sucess: true,
    message: 'Registered for the event Successfully.',
  });
};

module.exports.deregister = async (req, res, next) => {
  const event = await Event.findOneAndUpdate({ eventId: req.params.eventId },
    { $pull: { user: req.user._id } });
  if (!event) {
    const err = {
      statusCode: 404,
      message: 'Event not found',
    };
    return next(err);
  }
  if (!event.active) {
    const err = {
      statusCode: 403,
      message: 'Event is not active',
    };
    return next(err);
  }
  await User.findOneAndUpdate({ _id: req.user._id }, { $pull: { events: event._id } });
  return res.json({
    sucess: true,
    message: 'Deregistered from the event successfully.',
  });
};
