/* eslint-disable consistent-return */
/* eslint-disable func-names */
/* for all the middlewares required such as isLoggenIn */

//  checks if logged in already
module.exports.isLoggedIn = function (req, res, next) {
  req.session.returnTo = req.originalUrl;
  if (!req.isAuthenticated()) {
    res.status(403).json({ success: false, message: 'You are not logged in' });
  }
  next();
};
