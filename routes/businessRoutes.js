const express = require('express');
const router = express.Router();
const { getBusinessProfile, getPublicBusinessInfo } = require('../controllers/businessController');
const { protect } = require('../middleware/authMiddleware');

// Dashboard access ke liye (Protected)
router.get('/profile', protect, getBusinessProfile);

// Customer page fetch ke liye (Public)
router.get('/public/:id', getPublicBusinessInfo);

module.exports = router;