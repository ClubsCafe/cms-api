/* eslint-disable consistent-return */
const Institute = require('../../models/institute');
const Organization = require('../../models/organization');
const Event = require('../../models/event');
/*
middleware functions
 */

module.exports.checkmod = async (req, next) => {
  if (req.user.userType === 'mod') {
    const institute = await Institute.findOne(
      {
        instituteId: req.params.instituteId,
        $in: { mods: req.user._id },
      },
    );
    const eventCount = await Event.count({
      eventId: req.params.eventId,
      institute: institute._id,
    });
    if (!(institute.count() && eventCount)) {
      const err = {
        statusCode: 404,
        message: 'Institute Not Found or the current user is not a mod of the institute or event',
      };
      return next(err);
    }
  }
};
module.exports.checkeventmanager = async (req, next) => {
  if (req.user.userType === 'eventmanager') {
    const organization = await Organization.findOne(
      {
        organizationId: req.params.organizationId,
        $in: { eventmanagers: req.user._id },
      },
    );
    const eventCount = await Event.count({
      eventId: req.params.eventId,
      Organization: organization._id,
    });
    if (!(organization.count() && eventCount)) {
      const err = {
        statusCode: 404,
        message: 'Organization Not Found or the current user is not a eventmanager of the Organization',
      };
      return next(err);
    }
  }
};
module.exports.checkeventmanager2 = async (req, next) => {
  /* function here is diff from checkeventmanager mw function */
  if (req.user.userType === 'eventmanager') {
    const organization = await Organization.findOne(
      {
        organizationId: req.params.organizationId,
        $in: { eventmanagers: req.user._id },
      },
    );
    const eventCount = await Event.count({
      eventId: req.params.eventId,
      Organization: organization._id,
      $in: { awards: req.params.awardId },
    });
    if (!(organization.count() && eventCount)) {
      const err = {
        statusCode: 404,
        message: 'Organization Not Found or the current user is not a eventmanager of the Organization',
      };
      return next(err);
    }
  }
};
