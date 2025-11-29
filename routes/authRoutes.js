const express = require('express');
const router = express.Router();

const loginUser = require('../controller/loginUser');
const createUser = require('../controller/auth');
const verifyOtp = require('../controller/verifyOtp');
const reSendOtp = require('../controller/reSendOtp');
// const profile = require('../controller/profile');


router.post("/login", loginUser);
router.post("/signup", createUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", reSendOtp);
// router.get("/profile", profile);

module.exports = router;        