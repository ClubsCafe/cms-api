const passport = require('passport');
const GoogleTokenStrategy = require('passport-google-token').Strategy;

const User = require('../../models/user');
/* const Institute = require('../../models/institute');

const isValidEmail = (emailReg, email) => {
  const re = new RegExp(emailReg);
  return re.test(email);
}; */

passport.use(new GoogleTokenStrategy({
  clientID: process.env.GOOGLEAUTH_CLIENT_ID,
  clientSecret: process.env.GOOGLEAUTH_CLIENT_SECRET,
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  const user = await User.findOne({ email: profile.emails[0].value });
  if (user) {
    return done(null, user, { message: 'User Already exists' });
  }
  return done(null, false, { ...profile, message: 'User Not found' });
  // const { username, instituteId } = req.body;
  /* we need to check if the email is valid, for a particular institution
        received in request body
        Regex String will be saved in institute modal */
  /* const institute = await Institute.findOne({ instituteId });
  if (!institute) {
    const err = { statusCode: 404, message: 'Institute not found' };
    return done(err, false);
  }

  const instiRegex = new RegExp(`@${institute.emailRegex}$`);
  if (isValidEmail(instiRegex, profile.emails[0].value)) {
    user = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      username,
      institute: institute._id,
    });
    institute.members.push(user._id);
    try {
      await institute.save();
      await user.save();
    } catch (err) {
      return done(err, null);
    }
    return done(null, user);
  }
  const err = { statusCode: 400, message: 'Invalid email' };
  return done(err, false); */
}));
