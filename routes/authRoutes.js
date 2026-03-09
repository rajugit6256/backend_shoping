const express = require('express');
const router = express.Router();

const loginUser = require('../controller/loginUser');
const createUser = require('../controller/auth');
const verifyOtp = require('../controller/verifyOtp');
const reSendOtp = require('../controller/reSendOtp');
const logout = require('../controller/logout');
const refreshAccessToken = require('../controller/refreshToken');
const getProfile = require('../controller/profile/profile');
const authMiddleware = require('../Middleware/authentication');
const me = require('../controller/me');

router.post('/login', loginUser);
router.post('/signup', createUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', reSendOtp);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);
router.get('/me', authMiddleware, me);           // ✅ protected
router.get('/profile', authMiddleware, getProfile);

// ❌ Removed: /navbar — use /me instead on the frontend

module.exports = router;