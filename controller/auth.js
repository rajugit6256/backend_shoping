const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendEmail, otpEmailTemplate } = require("../services/emailService");

const createUser = async (req, res) => {
  try {
    const {name, email, phone, password, role } = req.body;

    // 1️⃣ Validate inputs
    if (!name || ! email || !password || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!validator.isMobilePhone(phone, "en-IN")) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // 2️⃣ Check email first
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // 3️⃣ Check phone next
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: "Phone number already exists" });
    }
// 1️⃣ Remove old pending user for same email
    await PendingUser.deleteOne({ email });
    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Generate OTP + hash OTP
    const otp = crypto.randomInt(1000, 10000).toString(); // 4-digit
    console.log("Your OTP is:", otp);

    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min

    // const otpExpiry = Date.now() + 1 * 1000; // 1 min

    // 6️⃣ Send OTP email before saving user
    try {
      await sendEmail(email, "Your OTP Code", otpEmailTemplate(otp));
    } catch (err) {
      console.error("OTP email failed:", err);
      return res.status(500).json({ error: "Failed to send OTP email" });
    }

    // 7️⃣ Save user
    const user = await PendingUser.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role === "teacher" ? "teacher" : "student", // default student
      emailOtpVerification: otpHash,
      emailOtpExpiry: otpExpiry,
      createdAt: new Date(),
    });

    // 8️⃣ Send safe response
    return res.status(200).json({
      success: true,
      message: "User registered. OTP sent to email.",
      otp: otp, // for testing only, remove in production
      userId: user._id, // send only safe data
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      eror:error,
      error: "Internal server error" 
    });
  }
};

module.exports = createUser;
