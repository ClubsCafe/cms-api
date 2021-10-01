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
/* requiring dependent route */
router
  .use('/events',
    eventRoutes);

router
  .route('/')
  /* POST request to create Organization of a institute */
  .post(
    isLoggedIn,
    isMod,
    fileUploads,
    catchAsync(organizations.createOrganization),
  );
router
  .route('/:organizationId/')
  /* GET request to get specific organization detail */
  .get(catchAsync(organizations.showOrganization))
  /* PUT request to edit specific organization detail */
  .put(
    isLoggedIn,
    catchAsync(isEventManager),
    fileUploads,
    catchAsync(organizations.editOrganization),
  )
  /* DELETE request to delete specific Organization */
  .delete(
    isLoggedIn,
    isMod,
    catchAsync(organizations.deleteOrganization),
  );
router
  .route('/:organizationId/eventmanagers')
  /* POST request for adding eventmanagers into the organization */
  .post(isLoggedIn,
    isMod,
    catchAsync(organizations.addEventManager));
router
  .route('/:organizationId/members')
  /* POST request for adding members into the organization */
  .post(isLoggedIn,
    catchAsync(isEventManager),
    catchAsync(organizations.addMember));
module.exports = router;
