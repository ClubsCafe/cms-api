require('dotenv').config();
// defining private urls and secret codes.
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/cmsapi';
const secretCode = process.env.SECRET_CODE || 'NITK_KODE';
const port = process.env.PORT || 5000


//requiring dependencies
const express = require('express');
const app = express();

//for overriding methods (via post)
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

//for passing body requests
app.use(express.urlencoded({extended:true}));

//for mongodb and sessions
const mongoose = require('mongoose')
const session = require('express-session');
//for using sessions within mongo and not locally in browser
const MongoStore = require('connect-mongo');

//for sending flash notices/warnings
const flash = require('connect-flash')



//connection to mongoose database
mongoose.connect(dbURL,
    {useNewUrlParser: true,
      useUnifiedTopology: true,})
        .then(console.log("connection to mongoDb successfull"))
        


const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: dbURL,
    secret: secretCode,
    ttl: 24*3600
  }),
  name: "cms-api",
  secret: secretCode,
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      /* secure:true,  for Https*/
      expires: Date.now() + 1000*60*60*24*7,
      maxAge: 1000*60*60*24*7 //expiry is 7days.
      } //set with maxAge as its at the bottom but its fine anyways hehe.
}

app.use(session(sessionConfig));
//for flash (sending warnings, infos, etc)
app.use(flash());


//for Authentication via passport currently only for local strategy
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');


app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// for req locals, accessible everywhere ;))))))
app.use(async (req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
  })

/* ROUTES BELOW */

//requiring routes
const userRoutes = require('./routes/users');



//using routes 
app.use('/users', userRoutes);



app.all('*', (req,res,next)=>{
    next(new ExpressError('Hi from Nitk | Page Not Found | lol currently we have nothing', 404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500, message="something went wrong"} =err;
    if(!err.message) err.message = "Oh no,Something went wrong."
    res.status(statusCode).render('error', {err})
})
//starting express api server
app.listen(port,()=>{
    console.log(`Successfully hosted at port ${port}`)
})


    