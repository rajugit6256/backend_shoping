const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User");
const PendingUser = require("../models/PendingUser");

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(400).json({ error: "User not found" });
    }

    // Already verified
    if (pendingUser.isVerified) {
      return res.status(400).json({ error: "User already verified" });
    }

    // 1️⃣ OTP Expiry check
    if (pendingUser.emailOtpExpiry < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // 2️⃣ Compare OTP
    const isMatch = await bcrypt.compare(otp, pendingUser.emailOtpVerification);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // 3️⃣ Transaction to create user + delete pending
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const newUser = await User.create(
        [
          {
            fullName: pendingUser.fullName,
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

      // 4️⃣ Final response
      return res.status(200).json({
        success: true,
        message: "Email verified successfully",
        user: newUser[0], // user document from array
      });

    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transaction Error:", err);
      return res.status(500).json({ error: "Internal error" });
    }

  } catch (err) {
    console.error("OTP Verification Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = verifyOtp;
