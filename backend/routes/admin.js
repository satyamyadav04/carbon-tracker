const express = require('express');
const { getUsers, getAdminSummary, updateUserRole } = require('../controllers/adminController');

const router = express.Router();

router.get('/summary', getAdminSummary);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
