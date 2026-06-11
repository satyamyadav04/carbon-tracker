const express = require('express');
const {
  createActivity,
  getActivities,
  getDashboard,
} = require('../controllers/activityController');

const router = express.Router();

router.post('/', createActivity);
router.get('/', getActivities);
router.get('/dashboard', getDashboard);

module.exports = router;
