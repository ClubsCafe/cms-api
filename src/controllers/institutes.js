const { cloudinary } = require("../services/cloudinary");

const Institute = require("../models/institute");
const Event = require("../models/event");
const User = require("../models/user");

/* to get all the events of the organizations  a
seperate get req will be made for all the events happening */
module.exports.index = async (req, res) => {
  const institutes = await Institute.find(req.query);
  return res.json({ success: true, institutes });
};
module.exports.createInstitute = async (req, res) => {
  const { name, instituteId, about, externalUrl, emailRegex } = req.body;
  const institute = new Institute({
    name,
    instituteId,
    about,
    externalUrl,
    emailRegex,
  });
  if (req.files?.logo) {
    institute.logo = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  if (req.files?.bannerImage) {
    institute.bannerImage = {
      url: req.files.bannerImage[0].path,
      filename: req.files.bannerImage[0].filename,
    };
  }
  await institute.save();
  return res.json({ success: true, institute });
};

module.exports.showInstitute = async (req, res, next) => {
  const institute = await Institute.findOne({
    instituteId: req.params.instituteId,
  })
    .populate("members", "-email")
    .populate("mods")
    .populate("organizations");
  if (!institute) {
    const err = { statusCode: 404, message: "Institute Not Found" };
    return next(err);
  }
  const activeEvents = await Event.find({
    institute: institute._id,
    completed: false,
  });
  const completedEvents = await Event.find({
    institute: institute._id,
    completed: true,
  });
  return res.json({
    success: true,
    institute,
    activeEvents,
    completedEvents,
  });
};

module.exports.editInstitute = async (req, res, next) => {
  const { name, instituteId, about, externalUrl, emailRegex } = req.body;
  if (req.user.userType === "mod") {
    const instituteCount = await Institute.count({
      instituteId: req.params.instituteId,
      $in: { mods: req.user._id },
    });
    if (!instituteCount) {
      const err = {
        statusCode: 404,
        message:
          "Institute Not Found or the current user is not a mod of the institute",
      };
      return next(err);
    }
  }
  const institute = await Institute.findOneAndUpdate(
    {
      instituteId: req.params.instituteId,
    },
    {
      name,
      instituteId,
      about,
      externalUrl,
      emailRegex,
    },
    { new: true }
  );
  if (!institute) {
    const err = { statusCode: 404, message: "Institute not found" };
    return next(err);
  }
  if (req.files?.logo) {
    await cloudinary.uploader.destroy(institute.logo.filename);
    institute.logo = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  if (req.files?.bannerImage) {
    await cloudinary.uploader.destroy(institute.bannerImage.filename);
    institute.bannerImage = {
      url: req.files.logo[0].path,
      filename: req.files.logo[0].filename,
    };
  }
  await institute.save();
  return res.json({
    success: true,
    message: "Institute details Updated Successfully",
    institute,
  });
};

/* To add event managers, you need to be a mod */
module.exports.addMod = async (req, res, next) => {
  const institute = await Institute.findOne({
    instituteId: req.params.instituteId,
  });
  if (!institute) {
    const err = { statusCode: 404, message: "Institute not found" };
    return next(err);
  }
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    const err = { statusCode: 404, message: "User not found" };
    return next(err);
  }
  const { userType } = user;
  if (userType === "admin" || userType === "mod") {
    institute.mods.push(user._id);
    await institute.save();
    res.json({
      success: true,
      institute,
    });
  }
  const err = {
    statusCode: 400,
    message: "The User doesn't have minimum previleges to become a mod",
  };
  return next(err);
};

module.exports.deleteInstitute = async (req, res, next) => {
  const institute = await Institute.find({
    eventId: req.params.instituteId,
  });
  if (!institute) {
    const err = { statusCode: 404, message: "Institute not found" };
    return next(err);
  }
  /* Will not be deleting events so that events occured or awards
   given stay. */
  await cloudinary.uploader.destroy(institute.bannerImage.filename);
  await cloudinary.uploader.destroy(institute.logo.filename);
  await Institute.findByIdAndDelete(institute._id);
  return res.json({
    success: true,
    message: "Institute has successfully be deleted",
  });
};

/* add/remove members function to be added yet, */
