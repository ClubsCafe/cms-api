// defining private urls and secret codes.
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/cmsapi';
const port = process.env.PORT || 4000;

// requiring dependencies
const express = require('express');

const app = express();

// for passing body requests
app.use(express.urlencoded({ extended: true }));

// for mongodb, passport(authentication) and sessions
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const { mongooseConfig, sessionConfig } = require('./services/db');
// for using sessions within mongo and not locally in browser

// connection to mongoose database
mongoose.connect(dbURL, mongooseConfig);

app.use(session(sessionConfig));

// for sending flash notices/warnings
app.use(flash());
// for Authentication via passport currently only for local strategy

const User = require('./models/user');

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async (req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

/* ROUTES BELOW */

/* requiring routes */
// for normal(any) user Routes especially for logging in
const userRoutes = require('./routes/users');
const organizationRoutes = require('./routes/organizations');
const eventRoutes = require('./routes/events');
const awardRoutes = require('./routes/awards');
const adminRoutes = require('./routes/admin');
const modRoutes = require('./routes/mod');

// using routes
app.use('/', userRoutes);
app.use('/admin', adminRoutes);
app.use('/mod', modRoutes);
app.use('/organizations', organizationRoutes);
app.use('/organizations/:organizationId/events', eventRoutes);
app.use('/organizations/:organizationId/events/:eventId/awards', awardRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'something went wrong' } = err;
  res.status(statusCode).send(message);/* .send(statusCode, {err}) */
});
// starting express api server
app.listen(port);
