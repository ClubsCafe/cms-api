const express = require('express');

const router = express.Router({ mergeParams: true });

const multer = require('multer');

const validationResult = require('../middlewares/validationResult');
const { InstituteValidation } = require('../validators/institutes');
const catchAsync = require('../utilities/catchasync');

const institutes = require('../controllers/institutes');
const OrganizationRoutes = require('./organizations');

const { isLoggedIn } = require('../middlewares/authentication');
const { isMod, isAdmin } = require('../middlewares/authorization');

const { storage } = require('../services/cloudinary');

const upload = multer({ storage });

const fileUploads = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 },
]);

/* using organization route(dependent routes) */
router.use('/:instituteId/organizations', OrganizationRoutes);

router
  .route('/')
  /* GET REQUEST for getting all the institutes details */
  .get(catchAsync(institutes.index))
  /* POST request for creating institutes */
  .post(
    isLoggedIn,
    isAdmin,
    fileUploads,
    InstituteValidation,
    validationResult,
    catchAsync(institutes.createInstitute),
  );
router
  .route('/:instituteId/')
  /* GET request for getting specific institute details */
  .get(catchAsync(institutes.showInstitute))
  /* PUT request for editing specific institute details */
  .put(
    isLoggedIn,
    isMod,
    fileUploads,
    InstituteValidation,
    validationResult,
    catchAsync(institutes.editInstitute),
  )
  /* DELETE request for deleting specific institute,
  Note that it doesn't delete sub organization.
  or it will be made to not do it but change it to a dummy
  insitute. */
  .delete(isLoggedIn, isAdmin, catchAsync(institutes.deleteInstitute));
router
  .route('/:instituteId/mods')
  /* POST Request to assign mods for a institute */
  .post(isLoggedIn, isAdmin, catchAsync(institutes.addMod));
router.route('/:instituteId/members');
module.exports = router;
