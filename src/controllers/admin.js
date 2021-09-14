const User = require('../models/user');

module.exports.changeUserType = async (req, res) => {
  const username = req.params.userId;
  const { userType } = req.body;
  const user = await User.findOneAndUpdate({ username }, { $set: { userType } }, { new: true });
  res.send(user);
};
