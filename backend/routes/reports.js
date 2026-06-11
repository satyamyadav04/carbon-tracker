const express = require('express');
const {
  createReport,
  getReportHistory,
  downloadReport,
  emailReport,
} = require('../controllers/reportController');

const router = express.Router();

router.post('/', createReport);
router.get('/history', getReportHistory);
router.get('/download/:id', downloadReport);
router.post('/email/:id', emailReport);

module.exports = router;
