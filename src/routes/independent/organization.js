const express = require('express');

const router = express.Router({ mergeParams: true });
const catchAsync = require('../../utilities/catchasync');
const organizations = require('../../controllers/organizations');

router
  .route('/')
  .get(catchAsync(organizations.index));
router
  .route('/:organizationId/')
  .get(catchAsync(organizations.showOrganization));
module.exports = router;
