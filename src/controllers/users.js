/* eslint-disable no-underscore-dangle */
const passport = require('passport');
const User = require('../models/user');

const { cloudinary } = require('../services/cloudinary');
// for managing images
module.exports.index = async (req, res) => {
  const admins = await User.find({ userType: 'admin' });
  const mods = await User.find({ userType: 'mod' });
  const eventManagers = await User.find({ userType: 'eventmanager' });
  const users = await User.find({ userType: 'user' });
  return res.json({
    success: true,
    admins,
    mods,
    eventManagers,
    users,
  });
};
// eslint-disable-next-line consistent-return
module.exports.createUser = async (req, res, next) => {
  try {
    const {
      email, name, username, password,
    } = req.body;
    const user = new User({
      email,
      name,
      username,
    });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      // eslint-disable-next-line no-undef
      if (err) return next(err);
      // so that we won't redirect to previous page :O when acc has been created.
      return res.json(201).json({
        success: true,
        user: registeredUser,
      });
    });
  } catch (err) {
    return next(err);
  }
};

module.exports.loginUser = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      return res.status(400).json({
        success: false,
        message: info,
      });
    }
    // eslint-disable-next-line consistent-return
    return req.logIn(user, (error) => {
      if (error) { return next(error); }
      return res.status(200).json({ success: true, user: req.user });
    });
  })(req, res, next);
};

module.exports.logoutUser = (req, res) => {
  req.logout();
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports.updateProfile = async (req, res, next) => {
  /* for updating profiles including avatar here. */
  const id = req.user._id;
  const {
    name, dob, bio, about,
  } = req.body;
  const user = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        name, dob, bio, about,
      },
    },
    { new: true },
  );
  if (!user) {
    const err = { statusCode: 404, message: 'User not found' };
    return next(err);
  }
  if (req.file) {
    if (user.avatar) {
      await cloudinary.uploader.destroy(user.avatar.filename);
    }
    user.avatar = { url: req.file.path, filename: req.file.filename };
  }
  await user.save();
  return res.status(201).json({
    success: true,
    user,
  });
};

module.exports.showProfile = async (req, res, next) => {
  const user = await User.find({ username: req.params.userId })
    .populate('awards')
    .populate('Organizations')
    .populate('events');
  if (!user) {
    const err = { statusCode: 404, message: 'User not found' };
    return next(err);
  }
  return res.status(200).json({
    success: true,
    user,
  });
};
