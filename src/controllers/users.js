/* eslint-disable no-underscore-dangle */
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logger = require('../services/logger');
const { cloudinary } = require('../services/cloudinary');
// for managing images
module.exports.index = async (req, res) => {
  const admins = await User.find(
    { userType: 'admin' },
    {
      username: 1,
      about: 1,
      bio: 1,
      points: 1,
      avatar: 1,
      createdAt: 1,
    },
  );
  const mods = await User.find(
    { userType: 'mod' },
    {
      username: 1,
      about: 1,
      bio: 1,
      points: 1,
      avatar: 1,
      createdAt: 1,
    },
  );
  const eventManagers = await User.find(
    { userType: 'eventmanager' },
    {
      username: 1,
      about: 1,
      bio: 1,
      points: 1,
      avatar: 1,
      createdAt: 1,
    },
  );
  const users = await User.find(
    { userType: 'user' },
    {
      username: 1,
      about: 1,
      bio: 1,
      points: 1,
      avatar: 1,
      createdAt: 1,
    },
  );
  return res.json({
    success: true,
    admins,
    mods,
    eventManagers,
    users,
  });
};

module.exports.loginUser = (req, res, next) => {
  passport.authenticate('google-token', async (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      return res.status(400).json({
        success: false,
        message: info,
      });
    }
    logger.debug('Google Auth');

    const { username } = user;
    const user01 = await User.findOne({ username });
    const token = jwt.sign({ username }, process.env.JWT_SECRET);
    return res.status(200).json({ success: true, token, user: user01 });
  })(req, res, next);
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
  const user = await User.findOne({ username: req.params.username })
    .populate('awards')
    .populate('organizations')
    .populate('events');
  if (!user) {
    const err = { statusCode: 404, message: 'User not found' };
    return next(err);
  }
  const email = (req.user.institute === user.institute) ? user.email : '';
  return res.status(200).json({
    success: true,
    user: {
      name: user.name,
      username: user.username,
      bio: user.bio,
      about: user.about,
      email,
    },
  });
};
