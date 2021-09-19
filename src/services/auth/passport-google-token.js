const passport = require('passport');
const GoogleTokenStrategy = require('passport-google-token').Strategy;

const User = require('../../models/user');

const isValidEmail = (emailReg, email) => {
  const re = new RegExp(emailReg);
  return re.test(email);
};

passport.use(new GoogleTokenStrategy({
  clientID: process.env.GOOGLEAUTH_CLIENT_ID,
  clientSecret: process.env.GOOGLEAUTH_CLIENT_SECRET,
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ email: profile.emails[0].value });
  if (user) {
    return done(null, user);
  }
  /* we need to check if the email is valid, for a particular institution
        received in request body
        Regex String will be saved in institute modal */
  const instiRegex = new RegExp('');

  if (isValidEmail(instiRegex, profile.emails[0].value)) {
    user = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      username: req.body.username,
    });
    await user.save();
    return done(null, user);
  }
  return done(null, false, { message: 'Invalid email' });
}));
