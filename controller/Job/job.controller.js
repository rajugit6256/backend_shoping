const Job = require("../../models/Job");

exports.createJob = async (req, res) => {
  const {
    title,
    description,
    requirements,
    location,
    isRemote,
    jobType,
    salary,
    category,
    skills,
    status,
    expiresAt,
  } = req.body;

  // 1. Manual validation — catch bad input before it hits MongoDB
  const errors = {};
  if (!title?.trim()) errors.title = "Title is required";
  if (!description?.trim()) errors.description = "Description is required";
  if (!location?.trim()) errors.location = "Location is required";
  if (!jobType) errors.jobType = "Job type is required";
  if (!category?.trim()) errors.category = "Category is required";

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors, // frontend can map these directly to form fields
    });
  }

  // 2. Build the job object explicitly — never spread req.body directly
  const jobData = {
    title: title.trim(),
    description: description.trim(),
    requirements: requirements || [],
    location: location.trim(),
    isRemote: isRemote || false,
    jobType,
    salary: salary || {},
    category: category.trim(),
    skills: skills || [],
    status: status || "draft",
    expiresAt: expiresAt || null,
    createdBy: req.user.id,
  };

  const job = await Job.create(jobData);

  // 3. Structured success response
  return res.status(201).json({
    success: true,
    message: "Job created successfully",
    data: { job },
  });
};
