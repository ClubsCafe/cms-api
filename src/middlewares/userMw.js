/* for all the middlewares required such as isLoggenIn */
const User = require('../models/user');


//checks if logged in already
module.exports.isLoggedIn = function(req,res,next){
    req.session.returnTo = req.originalUrl;
    if  (!req.isAuthenticated()){
    req.flash('error', 'you must be signed in');
    return res.redirect('/login');
    }
    next();
}
