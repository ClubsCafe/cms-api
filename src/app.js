// defining private urls and secret codes.
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/cmsapi';
const port = process.env.PORT || 5000;

// requiring dependencies
const express = require('express');

const app = express();

// for passing url-encoded body requests
app.use(express.urlencoded({ extended: true }));
/* passing json-body requests */
app.use(express.json());

// for mongodb, passport(authentication) and sessions
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const { mongooseConfig, sessionConfig } = require('./services/db');
const logger = require('./services/logger');
// for using sessions within mongo and not locally in browser

// connection to mongoose database
mongoose.connect(dbURL, mongooseConfig).then(() => {
  logger.info('Connected to mongoDB');
});

app.use(session(sessionConfig));

// for Authentication via passport currently only for local strategy

const User = require('./models/user');

app.use(passport.initialize());
app.use(passport.session());
/* for using passport-local strategy */
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* ROUTES BELOW */

/* requiring routes */
// for normal(any) user Routes especially for logging in
const userRoutes = require('./routes/users');
const organizationRoutes = require('./routes/independent/organization');
const eventRoutes = require('./routes/independent/events');
const adminRoutes = require('./routes/admin');
const modRoutes = require('./routes/mod');
const instituteRoutes = require('./routes/Institutes');
// using routes
app.use('/', userRoutes);
app.use('/institutes', instituteRoutes);
/* dashboard routes */
app.use('/admin', adminRoutes);
app.use('/mod', modRoutes);
/* independent routes */
app.use('/organizations', organizationRoutes);
app.use('/events', eventRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  /* setting up error message to be decalred if something throws an error */
  const { statusCode = 500, message = 'something went wrong' } = err;
  return res.status(statusCode).json({ success: false, message });
});
// starting express api server
app.listen(port, () => {
  logger.info(`Server started on port ${port}`);
});
