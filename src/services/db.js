/* mongodb related constants declarations */
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/cmsapi';

const mongoose = require('mongoose');
const logger = require('./logger');

mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  logger.info('Mongoose connected to Database');
}).catch((err) => {
  logger.error(`Mongoose connection error: ${err}`);
});

const db = mongoose.connection;

db.on('error', () => {
  logger.info('Error connecting to Database');
});

db.once('open', () => {
  logger.info('Connected to Database');
});
