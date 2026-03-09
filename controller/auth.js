const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendEmail, otpEmailTemplate } = require('../services/emailService');

const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // 1️⃣ Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validator.isMobilePhone(phone, 'en-IN')) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // ✅ Password strength validation
    if (!validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol',
      });
    }

    // 2️⃣ Check email uniqueness
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // 3️⃣ Check phone uniqueness
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: 'Phone number already exists' });
    }

    // 4️⃣ Remove any old pending entry for same email
    await PendingUser.deleteOne({ email });

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Generate 6-digit OTP + hash it
    const otp = crypto.randomInt(100000, 1000000).toString(); // ✅ 6 digits
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min

    // 7️⃣ Send OTP email before saving
    try {
      await sendEmail(email, 'Your OTP Code', otpEmailTemplate(otp));
    } catch (err) {
      console.error('OTP email failed:', err);
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    // 8️⃣ Save pending user
    const user = await PendingUser.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role === 'teacher' ? 'teacher' : 'student',
      emailOtpVerification: otpHash,
      emailOtpExpiry: otpExpiry,
      otpLastSentAt: new Date(),
    });

    // 9️⃣ Safe response — ✅ NO otp in response
    return res.status(200).json({
      success: true,
      message: 'User registered. OTP sent to email.',
      userId: user._id,
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = createUser;