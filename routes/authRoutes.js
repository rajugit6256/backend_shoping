const express = require('express');
const router = express.Router();

const loginUser = require('../controller/loginUser');
const createUser = require('../controller/auth');
const verifyOtp = require('../controller/verifyOtp');
const reSendOtp = require('../controller/reSendOtp');
const navbar = require('../controller/navbar');
const logout= require('../controller/logout');
const refreshAccessToken = require('../controller/refreshToken');
const getProfile = require('../controller/profile/profile');
const authMiddleware = require('../Middleware/authentication');


router.post("/login", loginUser);
router.post("/signup", createUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", reSendOtp);
router.get("/navbar", navbar);
router.post("/logout", logout);
router.post("/refresh-token", refreshAccessToken);
router.get("/profile", authMiddleware, getProfile);
// router.get("/profile", profile);

module.exports = router;        