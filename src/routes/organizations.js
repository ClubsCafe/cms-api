const express = require('express');

const router = express.Router({ mergeParams: true });

const multer = require('multer');
const eventRoutes = require('./events');

const catchAsync = require('../utilities/catchasync');

const organizations = require('../controllers/organizations');

const { isLoggedIn } = require('../middlewares/authentication');
const { isEventManager, isMod } = require('../middlewares/authorization');

const { storage } = require('../services/cloudinary');

const upload = multer({ storage });

const fileUploads = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 },
]);

router
  .use('/events',
    eventRoutes);

router
  .route('/')
  .get(catchAsync(organizations.index))
  .post(
    isLoggedIn,
    isMod,
    fileUploads,
    catchAsync(organizations.createOrganization),
  );
router
  .route('/:organizationId/')
  .get(catchAsync(organizations.showOrganization))
  .put(
    isLoggedIn,
    catchAsync(isEventManager),
    fileUploads,
    catchAsync(organizations.editOrganization),
  )
  .delete(
    isLoggedIn,
    isMod,
    catchAsync(organizations.deleteOrganization),
  );
router
  .route('/:organizationId/eventmanagers')
  .post(isLoggedIn,
    isMod,
    catchAsync(organizations.addEventManager));
router
  .route('/:organizationId/members')
  .post(isLoggedIn,
    catchAsync(isEventManager),
    catchAsync(organizations.addMember));
module.exports = router;
