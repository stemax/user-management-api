const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const adminDashboardController = require('../controllers/admin/dashboardController');

router.get('/', authMiddleware, roleMiddleware('admin'), adminDashboardController.grettings);

module.exports = router;
