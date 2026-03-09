const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
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
      index: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    // ✅ Store hashed refresh token — never plain text
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true } // ✅ auto adds createdAt + updatedAt
);

module.exports = mongoose.model('User', userSchema);