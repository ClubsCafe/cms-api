/* 
As considering the hirearchy level of access
 admins > mods >eventManagers > user
 
 everything the event managers can do is accessible by admins similarly for others 
*/
const User = require('../models/user');
const Organization = require('../models/organization')
// middleware checks if the loggen-in-user is admin
module.exports.isAdmin = async function(req,res,next){
    let userType = req.user.userType;
    if(userType === "admin"){
        next();
    } else {
        req.flash('error', "you do no have permission to do that!");
        return res.send("you do no have permission to do that!");
    }
}

// middleware checks if the loggen-in-user is admin or mod 
module.exports.isMod = async function(req,res,next){
    let userType = req.user.userType;
    if(userType === "admin" || userType==="mod"){
        next();
    } else {
        req.flash('error', "you do no have permission to do that!");
        return res.send("you do no have permission to do that!")
    }
}
// middleware checks if the loggen-in-user is admin or mod or EventManager
module.exports.isEventManager = async function(req,res,next){
    let userType = req.user.userType;
    const organizationCount = await Organization.find({
        organizationId:req.params.organizationId,
        eventmanagers: { $in: [req.user._id] },
    }).count();
    //checks if useraccount is greater than 0 or the id is same as loggeninId
    if(userType === "admin" || userType==="mod" || (userType==="eventmanager" && organizationCount)){
        next();
    } else {
        req.flash('error', "you do no have permission to do that!");
        return res.send("you do no have permission to do that!");
    }
}