const Job = require("../../models/Job");

const getAllJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      category,
      jobType,
      status = "active",
    } = req.query;
    const query = { status };

    if (search) query.$text = { $search: search };
    if (location) query.location = location;
    if (category) query.category = category;
    if (jobType) query.jobType = jobType;

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    console.log(jobs,query,"query");
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = getAllJobs;
