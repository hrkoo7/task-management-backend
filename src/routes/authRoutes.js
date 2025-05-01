const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { validateAuth } = require('../middlewares/validation');
const { authLimiter } = require('../middlewares/rateLimit');

router.post('/register', authLimiter, validateAuth, register);
router.post('/login', authLimiter, validateAuth, login);
router.post('/logout', logout);

module.exports = router;