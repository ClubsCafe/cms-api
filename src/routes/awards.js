const express = require('express');

const router = express.Router({ mergeParams: true });

const multer = require('multer');
const catchAsync = require('../utilities/catchasync');
const { isLoggedIn } = require('../middlewares/authentication');
const { isEventManager } = require('../middlewares/authorization');

const { storage } = require('../services/cloudinary');

const upload = multer({ storage });

const awards = require('../controllers/awards');

router
  .route('/')
  /* GET request for getting all awards of a specific event  */
  .get(catchAsync(awards.index))
  /* post request for creating an award for a specifc event */
  .post(
    isLoggedIn,
    catchAsync(isEventManager),
    upload.single('logo'),
    catchAsync(awards.createAward),
  );

router
  .route('/:awardId')
  /* GET request for getting specific award details */
  .get(catchAsync(awards.showAward))
  .put(
    isLoggedIn,
    catchAsync(isEventManager),
    upload.single('logo'),
    catchAsync(awards.editAward),
  )
  /* DELETE request for deleting specifc award, removes users from award and award from user */
  .delete(
    isLoggedIn,
    catchAsync(isEventManager),
    catchAsync(awards.deleteAward),
  );

router
  .route('/:awardId/giveAward')
  /* PUT request to give award to a user */
  .put(isLoggedIn, catchAsync(isEventManager), catchAsync(awards.giveAward));
module.exports = router;
