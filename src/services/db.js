/* mongodb related constants declarations */
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/cmsapi';
const secretCode = process.env.SECRET_CODE || 'NITK_KODE';
const MongoStore = require('connect-mongo');

module.exports.mongooseConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
/* config for mongo sessions (sessions to be stored on the server rather than on client-side.) */
module.exports.sessionConfig = {
  store: MongoStore.create({
    mongoUrl: dbURL,
    secret: secretCode,
    ttl: 24 * 3600,
  }),
  name: 'cms-api',
  secret: secretCode,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    /* secure:true,  for Https */
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7, // expiry is 7days.
  }, // set with maxAge as its at the bottom but its fine anyways hehe.
};
