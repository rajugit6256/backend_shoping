const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(400).json({ error: 'No pending registration found for this email' });
    }

    // 1️⃣ OTP expiry check
    if (pendingUser.emailOtpExpiry < Date.now()) {
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    // 2️⃣ Brute-force protection
    if (pendingUser.otpAttempts >= 5) {
      return res.status(429).json({ error: 'Too many attempts. Please request a new OTP.' });
    }

    // 3️⃣ Compare OTP
    const isMatch = await bcrypt.compare(otp, pendingUser.emailOtpVerification);
    if (!isMatch) {
      // Increment attempts on wrong OTP
      pendingUser.otpAttempts += 1;
      await pendingUser.save();
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // 4️⃣ Transaction: create verified user + delete pending
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const newUser = await User.create(
        [
          {
            name: pendingUser.name,
            email: pendingUser.email,
            phone: pendingUser.phone,
            password: pendingUser.password, // already hashed
            role: pendingUser.role,
            isVerified: true,
          },
        ],
        { session }
      );

      await PendingUser.deleteOne({ email }, { session });

      await session.commitTransaction();
      session.endSession();

      // ✅ Return only safe fields
      return res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        user: {
          id: newUser[0]._id,
          email: newUser[0].email,
          role: newUser[0].role,
        },
      });

    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('Transaction Error:', err);
      return res.status(500).json({ error: 'Internal error during verification' });
    }

  } catch (err) {
    console.error('OTP Verification Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = verifyOtp;