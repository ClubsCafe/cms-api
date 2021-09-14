const express = require('express');
const router = express.Router({mergeParams: true});

const catchAsync = require('../utilities/catchAsync')
const {isLoggedIn} = require('../middlewares/userMw');
const {isEventManager} = require('../middlewares/userTypeMw')

const multer  = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({ storage })

const fileUploads = upload.fields([
    {name: 'logo', maxCount: 1 }, 
    { name: 'bannerImage', maxCount: 1 }
])

const events = require('../controllers/events')

router.route('/')
    .get(catchAsync(events.index))
    .post(isLoggedIn, catchAsync(isEventManager),fileUploads, catchAsync(events.createEvent))
    
router.route('/:eventId')
    .get(catchAsync(events.showEvent))
    .put(isLoggedIn, catchAsync(isEventManager), fileUploads,  catchAsync(events.editEvent))
    .delete(isLoggedIn, catchAsync(isEventManager), catchAsync(events.deleteEvent))

module.exports = router;
