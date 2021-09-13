const User = require('../models/user');

const { cloudinary } = require('../cloudinary'); // for managing images


module.exports.index = async(req,res)=>{
  const admins = await User.find({userType:"admin"});
  const mods = await User.find({userType:"mod"});
  const eventManagers = await User.find({userType:"eventmanager"});
  const users = await User.find({userType:"user"});
  res.json({
    admins: admins,
    mods: mods,
    eventManagers: eventManagers,
    users: users
  })
}
module.exports.createUser = async (req, res) => {
  try {
    const {
      email, name, dob, username, password,
    } = req.body;
    const user = new User({
      email, name, dob, username,
    });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser,
      (err) => {
        if (err) return next(err);
        req.flash('success', 'Your account has successfully been created.');
        delete req.session.returnTo; // so that we won't redirect to previous page :O when acc has been created.
        res.send('success');
      });
  } catch (e) {
    req.flash('error', e.message);
    res.send(e.message);
  }
};

module.exports.loginUser = (req, res) => {
  req.flash('success', 'Welcome Back');
  const redirectUrl = req.session.returnTo || '/'; // session stores the previous page we tried to access so using returnTo will redirect us to that page
  res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
  req.logout();
  req.flash('success', 'Goodbye!');
  res.redirect('/');
};

module.exports.updateProfile = async (req, res) => {
  /* for updating profiles including avatar here. */
  const id = req.user._id;
  let {name, dob, bio, about } = req.body; 
  //gotta change it to username as profile will be given id will be kept hidden as possible
  const user = await User.findByIdAndUpdate(id,{$set: {name:name, dob:dob, bio:bio, about:about}}, {new: true});
  /* await User.findById(id) */
  if(req.file){
    if(user.avatar){
      await cloudinary.uploader.destroy(user.avatar.filename);
    } 
    user.avatar = { url: req.file.path, filename: req.file.filename};
  }  
  await user.save(); 
  req.flash('success', 'Successfully updated User Profile!')
  res.send(user)
};

module.exports.showProfile = async (req, res) => {
  const user = await User.find({username: req.params.userId}).populate('awards').populate('Organizations').populate('events');
  if(!user){
    req.flash('error', 'Cannot find the specified user')
    res.redirect(`/users/`)
  }
  res.json(user);
};



