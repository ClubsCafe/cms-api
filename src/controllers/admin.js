const User = require('../models/user');
/* Admins can change user type of any user(except admins from the dashboard.) */
module.exports.changeUserType = async (req, res, next) => {
  const { username } = req.params;
  const { userType } = req.body;
  const user = await User.findOneAndUpdate({ username }, { $set: { userType } }, { new: true });
  if (user.userType === 'admin') {
    const err = { message: 'Forbidden, You don\'t have the permission', statusCode: 403 };
    return next(err);
  }
  return res.send(user);
};
