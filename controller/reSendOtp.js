const PendingUser = require('../models/PendingUser');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { sendEmail, otpEmailTemplate } = require('../services/emailService');

const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute cooldown

const reSendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await PendingUser.findOne({ email });

    // ✅ Generic response — prevents user enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, an OTP has been sent',
      });
    }

    // ✅ Rate limit: enforce 1-minute cooldown between resends
    if (
      user.otpLastSentAt &&
      Date.now() - new Date(user.otpLastSentAt).getTime() < RESEND_COOLDOWN_MS
    ) {
      return res.status(429).json({
        error: 'Please wait 1 minute before requesting another OTP',
      });
    }

    // ✅ Generate new 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min validity

    // Send email
    try {
      await sendEmail(email, 'Your OTP Code', otpEmailTemplate(otp));
    } catch (err) {
      console.error('OTP email failed:', err);
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    // Update OTP fields + reset attempts + update cooldown timestamp
    user.emailOtpVerification = otpHash;
    user.emailOtpExpiry = otpExpiry;
    user.otpAttempts = 0;           // ✅ reset attempts on resend
    user.otpLastSentAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
    });

  } catch (error) {
    console.error('Error in reSendOtp:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = reSendOtp;