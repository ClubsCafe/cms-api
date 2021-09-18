const User = require('../models/user');

module.exports.changeUserType = async (req, res, next) => {
  const username = req.params.userId;
  const { userType } = req.body;
  if (userType === 'eventmanager' || userType === 'user') {
    const user = await User.findOneAndUpdate({ username }, { $set: { userType } }, { new: true });
    if (user.userType === 'mod' || user.userType === 'admin') {
      const err = { message: 'Forbidden, You don\'t have the permission', statusCode: 403 };
      return next(err);
    }
    return res.send({ success: true, user });
  }
  const err = { message: 'Forbidden, You don\'t have the permission', statusCode: 403 };
  return next(err);
};
