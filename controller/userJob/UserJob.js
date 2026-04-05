const Job = require("../../models/Job");
const Application = require("../../models/Application");

// 🔹 2. Get Job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 🔹 3. Apply for Job
exports.applyJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // ❌ prevent duplicate apply
    const alreadyApplied = await Application.findOne({
      job: jobId,
      user: req.user.id,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await Application.create({
      job: jobId,
      user: req.user.id,
      resume: req.body.resume,
      coverLetter: req.body.coverLetter,
    });

    res.status(201).json({ success: true, application });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 🔹 4. Get My Applications
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      user: req.user.id,
    })
      .populate("job")
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};