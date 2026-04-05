const Job = require("../../models/Job");

const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    // console.log(job,req.user.id,"shsh")
    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }
    
    // 🔐 Ownership check
    console.log(job, req.user.id, "shsh");
    if (job.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "You can update only your jobs" });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({ success: true, job: updatedJob });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = updateJob;
