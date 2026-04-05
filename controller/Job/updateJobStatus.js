const Job = require("../../models/Job");

const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // ✅ Validate status
    const validStatus = ["draft", "active", "closed"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // 🔐 Update only if owner
    const job = await Job.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id,
      },
      { status },
      { new: true },
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found or not authorized",
      });
    }

    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = updateJobStatus;
