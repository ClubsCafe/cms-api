const express = require('express');
const router = express.Router({mergeParams: true});

const catchAsync = require('../utilities/catchasync');

const organizations = require('../controllers/organizations');

const {isLoggedIn} = require('../middlewares/userMw');
const {isEventManager, isMod} = require('../middlewares/userTypeMw')

const multer  = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({ storage })

const fileUploads = upload.fields([
    {name: 'logo', maxCount: 1 }, 
    { name: 'bannerImage', maxCount: 1 }
])

router.route('/')
    .get(catchAsync(organizations.index))
    .post(isLoggedIn,catchAsync(isMod) , fileUploads,  catchAsync(organizations.createOrganization))
router.route('/:organizationId/')
    .get(catchAsync(organizations.showOrganization))
    .put(isLoggedIn,catchAsync(isEventManager),upload.array('image'), catchAsync(organizations.editOrganization))
    .delete(isLoggedIn, catchAsync(isMod), catchAsync(organizations.deleteOrganization))


    module.exports = router;