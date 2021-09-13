const express = require('express');

const router = express.Router({ mergeParams: true });

const passport = require('passport');
const catchAsync = require('../utilities/catchasync');

const users = require('../controllers/users');

const multer  = require('multer')
const {storage} = require('../cloudinary');
const { isLoggedIn } = require('../middlewares/userMw');
const upload = multer({ storage })


router.route('/register')
  .post(catchAsync(users.createUser));

/* for getting all users list according to userType */
router.route('/')
    .get( catchAsync(users.index))
    .put(isLoggedIn, upload.single('avatar'),catchAsync(users.updateProfile))

/* Note: userId refers to the username and not the objectId */
router.route('/:userId')
  .get(catchAsync(users.showProfile))

router.route('/login')
  .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser);

router.get('/logout', users.logoutUser);

module.exports = router;
