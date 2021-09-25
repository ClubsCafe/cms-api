const express = require('express');

const { isLoggedIn } = require('../middlewares/authentication');
const { isAdmin } = require('../middlewares/authorization');

const admin = require('../controllers/admin');

const router = express.Router({ mergeParams: true });

/* Same management page will be given */
/* Admin related routes */
router.route('/users/:username/type/')

  // req.body should contain the type.
  .put(isLoggedIn,
    isAdmin, admin.changeUserType);
module.exports = router;
