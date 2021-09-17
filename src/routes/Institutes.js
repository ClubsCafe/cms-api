const express = require('express');

const router = express.Router({ mergeParams: true });

const multer = require('multer');
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

router.use('/organizations', OrganizationRoutes);
router
  .route('/')
  .get(catchAsync(institutes.index))
  .post(
    isLoggedIn,
    isAdmin,
    fileUploads,
    catchAsync(institutes.createInstitute),
  );
router
  .route('/:instituteId/')
  .get(catchAsync(institutes.showInstitute))
  .put(
    isLoggedIn,
    isMod,
    upload.array('image'),
    catchAsync(institutes.editInstitute),
  )
  .delete(
    isLoggedIn,
    isAdmin,
    catchAsync(institutes.deleteInstitute),
  );
router
  .route('/:instituteId/mods')
  .post(isLoggedIn,
    isAdmin,
    catchAsync(institutes.addMod));
router
  .route('/:instituteId/members')
  .post(isLoggedIn,
    isMod,
    catchAsync(institutes.addMember));
module.exports = router;
