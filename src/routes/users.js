const express = require('express');

const router = express.Router({ mergeParams: true });

const multer = require('multer');
const catchAsync = require('../utilities/catchasync');

const users = require('../controllers/users');

const { storage } = require('../services/cloudinary');
const { isLoggedIn } = require('../middlewares/authentication');

const upload = multer({ storage });

/* post request to register */
router
  .route('/register')
  .post(catchAsync(users.createUser));

router
  .route('/')
  // eslint-disable-next-line consistent-return
  .get((req, res, next) => {
    if (req.user) return res.json(req.user);
    const err = { statusCode: 403, message: 'you are not logged in' };
    next(err);
  });

/* for getting all users list according to userType */
router
  .route('/users')
  /* route to get all users details */
  .get(catchAsync(users.index))
  /* updating profile section. */
  .put(isLoggedIn,
    upload.single('avatar'),
    catchAsync(users.updateProfile));

/* Note: userId refers to the username and not the objectId */
router
  .route('/users/:userId')
  /* GET request to get specific profile details */
  .get(catchAsync(users.showProfile));

router
  .route('/login')
  /* post request for logging in  */
  .post(users.loginUser);
/* get requesst to logout */
router
  .get('/logout',
    users.logoutUser);
module.exports = router;
