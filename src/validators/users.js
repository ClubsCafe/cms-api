const { body } = require('express-validator');

module.exports.userSignupValidation = [
  body('username')
    .exists({ checkFalsy: true })
    .withMessage('username cannot be empty')
    .isString()
    .isLength({ min: 1, max: 15 })
    .withMessage('length of username should be between 1 and 15 characters'),
  body('instituteId')
    .exists({ checkFalsy: true })
    .withMessage('instituteId cannot be empty')
    .isString()
    .isLength({ max: 8 })
    .withMessage(
      'length of the instituteid should consists of maximum 8 characters.',
    ),
  body('email').isEmail().withMessage('please enter valid email address'),
  body('name')
    .isLength({ min: 1, max: 25 })
    .withMessage('length of name should be between 1 and 25 characters')
    .isLength()
    .isString()
    .withMessage('Please enter a valid name'),
  body('access_token')
    .exists({ checkFalsy: true })
    .withMessage('valid access-token is required')
    .isString()
    .withMessage('valid access-token is required'),
];

module.exports.userUpdateValidation = [
  body('bio')
    .optional()
    .isString()
    .isLength({ max: 160 })
    .withMessage(
      'length of the bios should consists of maximum 160 characters.',
    ),
  body('about')
    .optional()
    .isString()
    .isLength({ max: 300 })
    .withMessage(
      'length of the instituteid should consists of maximum 300 characters.',
    ),
  body('dob').optional().isDate().withMessage('Enter valid Date of birth'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 25 })
    .withMessage('length of name should be between 1 and 25 characters')
    .isLength()
    .isString()
    .withMessage('Please enter a valid name'),
];

module.exports.userLoginValidation = [
  body('access_token')
    .exists({ checkFalsy: true })
    .withMessage('valid access-token is required')
    .isString()
    .withMessage('valid access-token is required'),
];
