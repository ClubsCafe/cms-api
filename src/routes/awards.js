const express = require('express');

const router = express.Router({ mergeParams: true });

const multer = require('multer');
const catchAsync = require('../utilities/catchasync');
const { isLoggedIn } = require('../middlewares/authentication');
const { isEventManager } = require('../middlewares/authorization');

const { storage } = require('../cloudinary');

const upload = multer({ storage });

const awards = require('../controllers/awards');

router
  .route('/')
  .get(catchAsync(awards.index))
  .post(
    isLoggedIn,
    catchAsync(isEventManager),
    upload.single('logo'),
    catchAsync(awards.createAward),
  );

router
  .route('/:awardId')
  .get(catchAsync(awards.showAward))
  .put(
    isLoggedIn,
    catchAsync(isEventManager),
    upload.single('logo'),
    catchAsync(awards.editAward),
  )
  .delete(
    isLoggedIn,
    catchAsync(isEventManager),
    catchAsync(awards.deleteAward),
  );

router
  .route('/:awardId/giveAward')
  .put(isLoggedIn, catchAsync(isEventManager), catchAsync(awards.giveAward));
module.exports = router;
