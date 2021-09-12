const { createLogger, format, transports } = require('winston');

const {
  combine, timestamp, label, printf,
} = format;

const developmentLogger = () => {
  const myFormat = printf(({ level, message, ts }) => `${ts} ${level}: ${message}`);

  return createLogger({
    level: 'debug',
    format: combine(
      format.colorize(),
      label({ label: 'development' }),
      timestamp({ format: 'HH:mm:ss' }),
      myFormat,
    ),

    transports: [
      new transports.Console(),
      new transports.File({
        filename: 'logs/debug.log',
      }),
    ],
  });
};

module.exports = developmentLogger;
