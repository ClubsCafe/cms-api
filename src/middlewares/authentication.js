/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
/* for all the middlewares required such as isLoggenIn */

const passport = require('passport');

//  checks if request is authenticated (contains a valid token)
module.exports.isLoggedIn = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (!user) {
      return res.status(403).json({ success: false, message: 'You are not logged in' });
    }
    req.user = user;
    return next();
  })(req, res, next);
};
