const express = require('express');
const {
  getTotalCarbon,
  getEmissionByWindow,
  getPieChartData,
  getSustainabilityScore,
  getLeaderboard,
} = require('../controllers/analyticsController');

const router = express.Router();

router.get('/total-carbon', getTotalCarbon);
router.get('/today', (req, res, next) => {
  req.params.days = '1';
  req.params.label = 'today';
  getEmissionByWindow(req, res, next);
});
router.get('/weekly', (req, res, next) => {
  req.params.days = '7';
  req.params.label = 'weekly';
  getEmissionByWindow(req, res, next);
});
router.get('/monthly', (req, res, next) => {
  req.params.days = '30';
  req.params.label = 'monthly';
  getEmissionByWindow(req, res, next);
});
router.get('/pie', getPieChartData);
router.get('/sustainability-score', getSustainabilityScore);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
