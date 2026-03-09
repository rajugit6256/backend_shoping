const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'teacher'],
      default: 'student',
      required: true,
    },
    emailOtpVerification: {
      type: String,
      default: null,
    },
    emailOtpExpiry: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,        // ✅ track brute-force attempts
    },
    otpLastSentAt: {
      type: Date,
      default: null,     // ✅ track resend cooldown
    },
    // ✅ TTL index: auto-delete pending users after 10 minutes
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600,
    },
  }
  // ❌ Removed: isVerified (always false here — redundant)
  // ❌ Removed: refreshToken (pending users never get tokens)
);

module.exports = mongoose.model('PendingUser', pendingUserSchema);