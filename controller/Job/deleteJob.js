const Job = require("../../models/Job");

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found or not authorized",
      });
    }

    res.json({ success: true, message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = deleteJob;
