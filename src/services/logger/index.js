const developmentLogger = require('./developmentLogger');
const productionLogger = require('./productionLogger');

let logger = null;

if (process.env.NODE_ENV === 'production') {
  logger = productionLogger();
} else {
  logger = developmentLogger();
}

module.exports = logger;
