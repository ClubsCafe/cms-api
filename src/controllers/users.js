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
  res.json({
    admins,
    mods,
    eventManagers,
    users,
  });
};
module.exports.createUser = async (req, res) => {
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
    // eslint-disable-next-line consistent-return
    req.login(registeredUser, (err) => {
      // eslint-disable-next-line no-undef
      if (err) return next(err);
      // so that we won't redirect to previous page :O when acc has been created.
      res.send(user);
      delete req.session.returnTo;
    });
  } catch (e) {
    res.send(e.message);
  }
};

module.exports.loginUser = (req, res, next) => {
  // eslint-disable-next-line consistent-return
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    res.json(info);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: info,
      });
    }
    // eslint-disable-next-line consistent-return
    req.logIn(user, (error) => {
      if (error) { return next(error); }
      res.json({ success: true, user: req.user });
    });
  })(req, res, next);
};

module.exports.logoutUser = (req, res) => {
  req.logout();
  res.send('logout successfull');
};

module.exports.updateProfile = async (req, res) => {
  /* for updating profiles including avatar here. */
  const id = req.user._id;
  const {
    name, dob, bio, about,
  } = req.body;
  // gotta change it to username as profile will be given id will be kept hidden as possible
  const user = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        name, dob, bio, about,
      },
    },
    { new: true },
  );
  /* await User.findById(id) */
  if (req.file) {
    if (user.avatar) {
      await cloudinary.uploader.destroy(user.avatar.filename);
    }
    user.avatar = { url: req.file.path, filename: req.file.filename };
  }
  await user.save();
  res.send(user);
};

module.exports.showProfile = async (req, res) => {
  const user = await User.find({ username: req.params.userId })
    .populate('awards')
    .populate('Organizations')
    .populate('events');
  if (!user) {
    res.redirect('/users/');
  }
  res.json(user);
};
