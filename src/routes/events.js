const express = require('express');

const router = express.Router({ mergeParams: true });
const multer = require('multer');
const awardRoutes = require('./awards');
const catchAsync = require('../utilities/catchasync');
const { isLoggedIn } = require('../middlewares/authentication');
const { isEventManager } = require('../middlewares/authorization');

const { storage } = require('../cloudinary');

const upload = multer({ storage });

const fileUploads = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 },
]);

const events = require('../controllers/events');

router.use(
  '/awards',
  awardRoutes,
);

router
  .route('/')
  .get(
    events.organizationIndex,
  )
  .post(
    isLoggedIn,
    catchAsync(isEventManager),
    fileUploads,
    catchAsync(events.createEvent),
  );

router
  .route('/register')
  .post(isLoggedIn,
    catchAsync(events.register));

router
  .route('/register')
  .post(isLoggedIn,
    catchAsync(events.deregister));

router
  .route('/:eventId')
  .get(catchAsync(events.showEvent))
  .put(
    isLoggedIn,
    catchAsync(isEventManager),
    fileUploads,
    catchAsync(events.editEvent),
  )
  .delete(
    isLoggedIn,
    catchAsync(isEventManager),
    catchAsync(events.deleteEvent),
  );

module.exports = router;
