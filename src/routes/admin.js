const express = require('express');

const { isLoggedIn } = require('../middlewares/authentication');
const { isAdmin } = require('../middlewares/authorization');

const admin = require('../controllers/admin');

const router = express.Router({ mergeParams: true });

/* Same management page will be given */
/* Admin related routes */
router.route('/users/:userId/type/')

/* req.body should contain the type.
userId is the username(not the objectId of the user)
*/
  .put(isLoggedIn,
    isAdmin, admin.changeUserType);
module.exports = router;
