const { body } = require('express-validator');

module.exports.InstituteValidation = [
  body('name')
    .exists({ checkFalsy: true })
    .withMessage('name of the insititute cannot be empty')
    .isString()
    .isLength({ min: 1, max: 80 })
    .withMessage('length of name should be between 1 and 80 characters'),
  body('instituteId')
    .exists({ checkFalsy: true })
    .withMessage('instituteId cannot be empty')
    .isString()
    .isLength({ max: 8 })
    .withMessage(
      'length of the instituteid should consists of maximum 8 characters.',
    ),
  body('about').optional().isString(),
  body('externalUrl').isURL().withMessage('A valid external Url is required'),
  body('emailRegex')
    .isString()
    .exists({ checkFalsy: true })
    .withMessage('valid Email regex is required'),
];
