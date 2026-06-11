const express = require('express');
const authRoutes = require('./auth');
const activityRoutes = require('./activities');
const analyticsRoutes = require('./analytics');
const assistantRoutes = require('./assistant');
const reportRoutes = require('./reports');
const adminRoutes = require('./admin');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Carbon Tracker API is healthy' });
});

router.use('/auth', authRoutes);
router.use('/activities', authMiddleware, activityRoutes);
router.use('/analytics', authMiddleware, analyticsRoutes);
router.use('/assistant', authMiddleware, assistantRoutes);
router.use('/reports', authMiddleware, reportRoutes);
router.use('/admin', authMiddleware, adminMiddleware, adminRoutes);

module.exports = router;
