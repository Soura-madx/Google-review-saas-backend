const express = require('express');
const router = express.Router();
const { generateReview } = require('../controllers/reviewController');

// POST route jahan frontend tag bhejega
router.post('/generate', generateReview);

module.exports = router;