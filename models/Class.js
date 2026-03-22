
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    section: { type: String, trim: true },
    subject: { type: String, trim: true },
    joinCode: {
      type: String,
      required: true,
      unique: true, // ✅ MongoDB enforces uniqueness at DB level
      index: true, // ✅ fast lookup
    },
    coverColor: { type: String, default: "#1967D2" },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ Students who have joined
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ✅ Whitelisted emails — only these can join
    allowedEmails: [{ type: String, lowercase: true, trim: true }],

    // ✅ Pending invites (invited but not yet joined)
    invites: [
      {
        email: { type: String, lowercase: true, trim: true },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending",
        },
        sentAt: { type: Date, default: Date.now },
      },
    ],

    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Class", classSchema);
