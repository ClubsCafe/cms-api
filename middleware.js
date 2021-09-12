/* for all the middlewares required such as isLoggenIn */
const User = require('./models/user');


//checks if logged in already
module.exports.isLoggedIn = function(req,res,next){
    req.session.returnTo = req.originalUrl;
    if  (!req.isAuthenticated()){
    req.flash('error', 'you must be signed in');
    return res.redirect('/login');
    }
    next();
}
/* 
As considering the hirearchy level of access
 admins > mods >eventManagers > user
 everything the event managers can do is accessible by admins similarly for others 
 */
// middleware checks if the user is admin
module.exports.isAdmin = async function(req,res,next){
    const user = User.findById(req.user._id);
    let userType = User.userType;
    if(userType = "admin"){
        next();
    } else {
        req.flash('error', "you do no have permission to do that!");
        return res.redirect(`/`);
    }
}

// middleware checks if the user is admin or mod 
module.exports.ismod = async function(req,res,next){
    const user = User.findById(req.user._id);
    let userType = User.userType;
    if(userType === "admin" || userType==="mod"){
        next();
    } else {
        req.flash('error', "you do no have permission to do that!");
        return res.redirect(`/`);
    }
}
// middleware checks if the user is admin or mod or EventManager
module.exports.isEventManager = async function(req,res,next){
    const user = User.findById(req.user._id);
    let userType = User.userType;
    if(userType === "admin" || userType==="mod" || userType==="eventmanager"){
        next();
    } else {
        req.flash('error', "you do no have permission to do that!");
        return res.redirect(`/`);
    }
}

