const Job = require("../../models/Job");

const getAllJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      category,
      jobType,
      status = "active",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (search) query.$text = { $search: search };
    if (location) query.location = { $regex: location, $options: "i" };
    if (category) query.category = category;
    if (jobType) query.jobType = jobType;

    const skip = (Number(page) - 1) * Number(limit);

    // 🔹 Fetch jobs
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("createdBy", "companyName");

    const totalJobs = await Job.countDocuments(query);

    // 🔹 Transform jobs
    const formattedJobs = jobs.map((job) => ({
      id: job._id,
      title: job.title,
      location: job.location,
      jobType: job.jobType,
      requirements: job.requirements,
      skills: job.skills,
      isRemote: job.isRemote,
      companyName: job.createdBy?.companyName || "N/A",
      salary: {
        min: job.salary?.min,
        max: job.salary?.max,
        currency: job.salary?.currency,
      },
    }));

    // 🔥 Category-wise count
    const categoryCounts = await Job.aggregate([
      { $match: { status: "active" } }, // you can also use query if needed
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
        },
      },
    ]);

    // ✅ Final response
    res.json({
      success: true,
      totalJobs,
      currentPage: Number(page),
      totalPages: Math.ceil(totalJobs / limit),
      jobs: formattedJobs,
      categoryCounts, // 👈 added here
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = getAllJobs;
