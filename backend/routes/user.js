const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount
} = require('../controllers/user');

const { protect } = require('../middleware/auth');

// All routes are protected and require authentication
router.use(protect);

// Routes
router
  .route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.route('/delete-account').delete(deleteUserAccount);

module.exports = router;
