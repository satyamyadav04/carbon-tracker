const express = require('express');
const {
  getRecommendations,
  getMonthlyAnalysis,
  chatAssistant,
} = require('../controllers/assistantController');

const router = express.Router();

router.get('/recommendations', getRecommendations);
router.get('/monthly-analysis', getMonthlyAnalysis);
router.post('/chat', chatAssistant);

module.exports = router;
