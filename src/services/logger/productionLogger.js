const { createLogger, format, transports } = require('winston');

const {
  combine, timestamp, label, json,
} = format;

const productionLogger = () => createLogger({
  level: 'info',
  format: combine(
    label({
      label: 'production',
    }),
    timestamp(),
    json(),
  ),

  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'logs/combined.log',
    }),
    new transports.File({
      filename: 'logs/errors.log',
      level: 'error',
    }),
  ],
});

module.exports = productionLogger;
