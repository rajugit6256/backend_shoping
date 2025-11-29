const PendingUser = require("../models/PendingUser");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { sendEmail, otpEmailTemplate } = require("../services/emailService");

const reSendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await PendingUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔥 Generate new 4-digit OTP
    const otp = crypto.randomInt(1000, 10000).toString();
    console.log("RESEND OTP:", otp);

    // 🔐 Hash OTP
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min validity

    // 📧 Send email
    try {
      await sendEmail(email, "Your resend OTP Code", otpEmailTemplate(otp));
    } catch (err) {
      console.error("OTP email failed:", err);
      return res.status(500).json({ error: "Failed to send OTP email" });
    }

    // 📝 Update only OTP fields
    user.emailOtpVerification = otpHash;
    user.emailOtpExpiry = otpExpiry;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });

  } catch (error) {
    console.error("Error in reSendOtp:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = reSendOtp;
