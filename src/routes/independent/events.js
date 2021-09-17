const express = require('express');

const router = express.Router({ mergeParams: true });

const catchAsync = require('../../utilities/catchasync');

const events = require('../../controllers/events');

router
  .route('/')
  .get(catchAsync(events.index));
router
  .route('/:eventId')
  .get(catchAsync(events.showEvent));
module.exports = router;
