/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/* eslint-disable func-names */
/*
As considering the hirearchy level of access
 admins > mods >eventManagers > user

 everything the event managers can do is accessible by admins similarly for others
*/
const Organization = require('../models/organization');
// middleware checks if the loggen-in-user is admin
module.exports.isAdmin = function (req, res, next) {
  const { userType } = req.user;
  if (userType === 'admin') {
    next();
  } else {
    return res.send('you do no have permission to do that!');
  }
};

// middleware checks if the loggen-in-user is admin or mod
module.exports.isMod = function (req, res, next) {
  const { userType } = req.user;
  if (userType === 'admin' || userType === 'mod') {
    next();
  } else {
    return res.send('you do no have permission to do that!');
  }
};

// this middleware checks if the loggen-in-user is admin or mod or EventManager
// this middleware is an async function so its recommended to use it inside catchasync function.
module.exports.isEventManager = async function (req, res, next) {
  const { userType } = req.user;
  const organizationCount = await Organization.find({
    organizationId: req.params.organizationId,
    eventmanagers: { $in: [req.user._id] },
  }).count();
  // checks if useraccount is greater than 0 or the id is same as loggeninId
  if (
    userType === 'admin'
    || userType === 'mod'
    || (userType === 'eventmanager' && organizationCount)
  ) {
    next();
  } else {
    return res.send('you do no have permission to do that!');
  }
};
