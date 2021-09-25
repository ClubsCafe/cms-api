const express = require('express');

const { isLoggedIn } = require('../middlewares/authentication');
const { isMod } = require('../middlewares/authorization');

const mod = require('../controllers/mod');

const router = express.Router({ mergeParams: true });

/* Same management page will be given */
/* AMod related routes */
router.route('/users/:username/type/')
  .put(isLoggedIn,
    isMod,
    mod.changeUserType);
module.exports = router;
