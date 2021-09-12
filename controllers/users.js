const User = require('../models/user');
const passport =require('passport')

module.exports.createUser= async (req,res)=>{
    try{
        const {email, name, dob, username, password} = req.body;
        const user= new User({email, name, dob, username});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser, 
            (err)=>{
                if (err) return  next(err);
                req.flash('success','Your account has successfully been created.');
                delete req.session.returnTo; //so that we won't redirect to previous page :O when acc has been created.
                res.redirect('/');
        })
    } catch(e){
        req.flash('error', e.message);
        res.redirect('register');        
    }
    
}

module.exports.loginUser = (req,res)=>{
    req.flash('success', 'Welcome Back');
    const redirectUrl = req.session.returnTo || '/';  //session stores the previous page we tried to access so using returnTo will redirect us to that page
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req,res)=>{
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/');
}

module.exports.updateProfile = async(req,res)=>{
    /* for updating profiles including avatar here.*/
}
module.exports.changePassword = async(req,res) =>{
    /* for changing password. updateProfile will not include changing passwords */
}
