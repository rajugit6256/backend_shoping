// models/Job.js
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: [{ type: String }], // bullet points
    location: { type: String, required: true },
    isRemote: { type: Boolean, default: false },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      required: true,
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "INR" },
    },
    category: { type: String, required: true }, // e.g. "Engineering", "Design"
    skills: [{ type: String }], // e.g. ["React", "Node.js"]
    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
    },
    expiresAt: { type: Date },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Text index for search
jobSchema.index({ title: "text", description: "text" });

// Regular indexes for filters
jobSchema.index({ location: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ status: 1 });

// TTL index — MongoDB auto-deletes expired jobs
jobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Job", jobSchema);
