const express = require('express');

const router = express.Router({ mergeParams: true });

const multer = require('multer');
const catchAsync = require('../utilities/catchasync');

const {
  userSignupValidation,
  userUpdateValidation,
  userLoginValidation,
} = require('../validators/users');
const validationResult = require('../middlewares/validationResult');

const users = require('../controllers/users');

const { storage } = require('../services/cloudinary');
const { isLoggedIn } = require('../middlewares/authentication');

const upload = multer({ storage });

router
  .route('/')
  // to get logged in user
  .get(isLoggedIn, (req, res) => {
    res.json(req.user);
  });

/* for getting all users list according to userType */
router
  .route('/users')
  /* route to get all users details */
  .get(isLoggedIn, catchAsync(users.index))
  /* updating profile section. */
  .put(
    isLoggedIn,
    upload.single('avatar'),
    userUpdateValidation,
    validationResult,
    catchAsync(users.updateProfile),
  );

/* Note: userId refers to the username and not the objectId */
router
  .route('/users/:username')
  /* GET request to get specific profile details */
  .get(isLoggedIn, catchAsync(users.showProfile));

router
  .route('/login')
  /* post request for logging in  */
  .post(userLoginValidation, validationResult, users.loginUser);

router
  .route('/signup')
  .post(
    upload.single('avatar'),
    userSignupValidation,
    validationResult,
    users.signupUser,
  );

module.exports = router;
