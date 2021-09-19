// basically adds the req,res,next arugments to the function

// and adds .catch so if error is thrown it will be sent to next
module.exports = (func) => (req, res, next) => {
  func(req, res, next).catch(next);
};
