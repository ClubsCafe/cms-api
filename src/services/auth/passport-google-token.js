const passport = require('passport');
const GoogleTokenStrategy = require('passport-google-token').Strategy;

const User = require('../../models/user');

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
}));
