/* eslint-disable no-underscore-dangle */
const User = require('../models/user');

const { cloudinary } = require('../cloudinary'); // for managing images

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
      email, name, dob, username, password,
    } = req.body;
    const user = new User({
      email,
      name,
      dob,
      username,
    });
    const registeredUser = await User.register(user, password);
    // eslint-disable-next-line consistent-return
    req.login(registeredUser, (err) => {
      // eslint-disable-next-line no-undef
      if (err) return next(err);
      // so that we won't redirect to previous page :O when acc has been created.
      res.send('success');
      delete req.session.returnTo;
    });
  } catch (e) {
    res.send(e.message);
  }
};

module.exports.loginUser = (req, res) => {
  /*  after successfull login */
  /* const redirectUrl = req.session.returnTo || '/'; */
  /* session stores the previous page we tried
   to access so using returnTo will redirect us to that page */
  res.send(req.user);
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
