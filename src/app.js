// defining private urls and secret codes.
const port = process.env.PORT || 5000;

// requiring dependencies
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');


const app = express();
// enabling CORS currently for all origins for development purposes
app.use(cors());
// helmet for security
app.use(helmet());
//express-mongo-sanitie for sanitizing mongo queries
const mongoSanitize = require('express-mongo-sanitize');
// for passing url-encoded body requests
app.use(express.urlencoded({ extended: true }));
/* passing json-body requests */
app.use(express.json());


/*SANITIZING MONGO QUERIES*/
// To remove data, use:
app.use(mongoSanitize());

// Or, to replace prohibited characters with _, use:
app.use(
  mongoSanitize({
    replaceWith: '_',
  }),
);

const passport = require('passport');
const logger = require('./services/logger');
require('./services/db');
require('./services/auth/passport-JWT');
require('./services/auth/passport-google-token');

app.use(passport.initialize());

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

app.use((err, req, res, next) => {
  /* setting up error message to be decalred if something throws an error */
  const { statusCode = 500, message = 'something went wrong' } = err;
  logger.error(err);
  return res.status(statusCode).json({ success: false, message });
});
// starting express api server
app.listen(port, () => {
  logger.info(`Server started on port ${port}`);
});
