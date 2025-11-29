const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
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
    enum: ["student", "teacher"],
    default: "student",
    required: true,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  emailOtpVerification: {
    type: String,
    default: null,
  },

  emailOtpExpiry: {
    type: Date,
    default: null,
  },
  refreshToken: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PendingUser", pendingUserSchema);
