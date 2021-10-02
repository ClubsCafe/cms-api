const Institute = require('../../models/institute');
const Organization = require('../../models/organization');
/*
middleware function
*/
// eslint-disable-next-line consistent-return
module.exports.checkmod = async (req, next) => {
  if (req.user.userType === 'mod') {
    const instituteCount = await Institute.count(
      {
        instituteId: req.params.instituteId,
        $in: { mods: req.user._id },
      },
    );
    if (!instituteCount) {
      const err = {
        statusCode: 404,
        message: 'Institute Not Found or the current user is not a mod of the institute',
      };
      return next(err);
    }
  }
};

// eslint-disable-next-line consistent-return
module.exports.checkeventmanager = async (req, next) => {
  if (req.user.userType === 'eventmanager') {
    const organizationCount = await Organization.count(
      {
        organizationId: req.params.organizationId,
        $in: { eventmanagers: req.user._id },
      },
    );
    if (!organizationCount) {
      const err = {
        statusCode: 404,
        message: 'Organization Not Found or the current user is not a mod of the Organization',
      };
      return next(err);
    }
  }
};
