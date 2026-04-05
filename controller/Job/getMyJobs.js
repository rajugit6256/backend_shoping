const Job = require("../../models/Job");

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      createdBy: req.user.id
    }).sort({ createdAt: -1 });

    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = getMyJobs;