const express = require('express');
const router = express.Router();

const loginUser = require('../controller/loginUser');
const createUser = require('../controller/Auth');
const verifyOtp = require('../controller/verifyOtp');


router.post("/login", loginUser);
router.post("/signup", createUser);
router.post("/verify-otp", verifyOtp);

module.exports = router;        