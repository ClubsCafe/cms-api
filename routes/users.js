const express = require('express');
const router = express.Router({mergeParams: true});

const catchAsync = require('../utilities/catchasync');


const passport = require('passport');
const users = require('../controllers/users');

router.route('/register')
    .post(catchAsync(users.createUser))

router.route('/login')
    .post(passport.authenticate('local', {failureFlash:true, failureRedirect:'/login'}), users.loginUser)
    
router.get('/logout', users.logoutUser);

module.exports = router;