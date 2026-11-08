const express = require('express');
const router = express.Router();
const { registerBusiness, loginBusiness } = require('../controllers/authController');

router.post('/register', registerBusiness);
router.post('/login', loginBusiness);

module.exports = router;