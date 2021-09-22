const express = require('express');

const router = express.Router({ mergeParams: true });
const multer = require('multer');
const awardRoutes = require('./awards');
const catchAsync = require('../utilities/catchasync');
const { isLoggedIn } = require('../middlewares/authentication');
const { isEventManager } = require('../middlewares/authorization');

const { storage } = require('../services/cloudinary');

const upload = multer({ storage });

const fileUploads = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 },
]);

const events = require('../controllers/events');

/* calling another dependent route */
router.use(
  '/awards',
  awardRoutes,
);

router
  .route('/')
  /* GET request forgetting all events of a specific organization */
  .get(
    events.organizationIndex,
  )
  /* POST request for creating events for an organization */
  .post(
    isLoggedIn,
    catchAsync(isEventManager),
    fileUploads,
    catchAsync(events.createEvent),
  );

router
  .route('/register')
  /* POST request for registring for an event */
  .post(isLoggedIn,
    catchAsync(events.register));

router
  .route('/deregister')
  /* POST request for deregistring from the event */
  .post(isLoggedIn,
    catchAsync(events.deregister));

router
  .route('/:eventId')
  /* GET request for getting specific event details */
  .get(catchAsync(events.showEvent))
  /* PUT request for editing specific event details */
  .put(
    isLoggedIn,
    catchAsync(isEventManager),
    fileUploads,
    catchAsync(events.editEvent),
  )
  /* DELETE request for deleting specific event */
  .delete(
    isLoggedIn,
    catchAsync(isEventManager),
    catchAsync(events.deleteEvent),
  );

module.exports = router;
