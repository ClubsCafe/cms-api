const { cloudinary } = require('../services/cloudinary');

const Event = require('../models/event');
const Organization = require('../models/organization');
const User = require('../models/user');
const Institute = require('../models/institute');
/* to get all the events of the organizations  a
seperate get req will be made for all the events happening */
module.exports.index = async (req, res) => {
  if (req.query.instituteId) {
    const institute = await Institute.findOne({ instittuteId: req.query.instituteId });
    req.query.institute = institute._id;
    delete req.query.instituteId;
  }
  const organizations = await Organization.find(req.query);
  return res.json({ success: true, organizations });
};

module.exports.createOrganization = async (req, res, next) => {
  const {
    name, organizationId, externalUrl, about, bio,
  } = req.body;
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
  const institute = await Institute.findOne({ instituteId: req.params.instituteId });
  const organization = new Organization({
    name,
    organizationId,
    bio,
    about,
    externalUrl,
  });
  organization.institute = institute._id;
  institute.organizations.push(organization._id);
  if (req.files?.logo) {
    organization.logo = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  if (req.files?.bannerImage) {
    organization.bannerImage = {
      url: req.files.bannerImage[0].path,
      filename: req.files.bannerImage[0].filename,
    };
  }
  await organization.save();
  await institute.save();
  return res.json({ success: true, organization });
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
    return next(err);
  }
  const activeEvents = await Event.find({
    organization: organization._id,
    completed: false,
  });
  const completedEvents = await Event.find({
    organization: organization._id,
    completed: true,
  });
  return res.json({
    success: true, organization, activeEvents, completedEvents,
  });
};

module.exports.editOrganization = async (req, res, next) => {
  const {
    name, organizationId, externalUrl, about, bio,
  } = req.body;
  const institute = await Institute.findOne({ instituteId: req.params.instituteId });
  if (!institute) {
    const err = {
      statusCode: 404,
      message: 'Institute not found.',
    };
    return next(err);
  }
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
  const organization = await Organization.findOneAndUpdate(
    {
      organizationId: req.params.organizationId,
      institute: institute._id,
    },
    {
      name,
      organizationId,
      externalUrl,
      bio,
      about,
    },
    { new: true },
  );
  if (!organization) {
    const err = { statusCode: 404, message: 'Organization not found' };
    return next(err);
  }
  if (req.files?.logo) {
    await cloudinary.uploader.destroy(organization.logo.filename);
    organization.logo = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  if (req.files?.bannerImage) {
    await cloudinary.uploader.destroy(organization.bannerImage.filename);
    organization.bannerImage = {
      url: req.files.bannerImage[0].path,
      filename: req.files.bannerImage[0].filename,
    };
  }
  await organization.save();
  return res.json({ success: true, organization });
};

/* To add event managers, you need to be a mod */
module.exports.addEventManager = async (req, res, next) => {
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
  const user = await User.findOne({ username: req.body.username });
  const institute = await Institute.findOne({ instituteId: req.params.instituteId });
  if (!institute) {
    const err = {
      statusCode: 404,
      message: 'Institute not found.',
    };
    return next(err);
  }
  const organization = await Organization.findOne({
    organizationId: req.params.organizationId,
    institute: institute._id,
    $in: {
      members: user._id,
    },
  });
  if (!organization) {
    const err = {
      statusCode: 403,
      message: 'Organization not found or the user is not a member of the organization',
    };
    return next(err);
  }
  if (!user) {
    const err = { statusCode: 404, message: 'User not found' };
    return next(err);
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
    return res.json();
  }
  const err = {
    statusCode: 400,
    message: 'The User doesn\'t have minimum previleges to become a EventManager',
  };
  return next(err);
};

module.exports.addMember = async (req, res, next) => {
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
  }).populate('institute');
  const user = await User.findOne({
    username: req.body.username,
    $in: { organizations: organization._id },
  });
  if (!user) {
    const err = { statusCode: 404, message: 'User not found' };
    return next(err);
  }
  if (user.institute !== organization.institute) {
    const err = { statusCode: 403, message: 'User is not a member of the institute' };
    return next(err);
  }
  user.organization.push(organization._id);
  organization.members.push(user._id);
  await user.save();
  await organization.save();
  return res.json({ success: true, user, organization });
};

module.exports.deleteOrganization = async (req, res, next) => {
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
  const institute = await Institute.findOne({ instituteId: req.params.instituteId });
  if (!institute) {
    const err = {
      statusCode: 404,
      message: 'Institute not found.',
    };
    return next(err);
  }
  const organization = await Organization.find({
    organizationId: req.params.organizationId,
    institute: institute._id,
  });
  if (!organization) {
    const err = { statusCode: 404, message: 'Organization not found' };
    return next(err);
  }
  await cloudinary.uploader.destroy(organization.bannerImage.filename);
  await cloudinary.uploader.destroy(organization.logo.filename);
  await organization.findByIdAndDelete(organization._id);
  return res.json({ success: true, message: 'Organization deleted Successfully' });
};

/* add/remove members function to be added yet, */
