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

    const baseQuery = {};
    if (status) baseQuery.status = status;

    const filterQuery = { ...baseQuery };

    if (search) filterQuery.$text = { $search: search };
    if (location) filterQuery.location = { $regex: location, $options: "i" };
    if (category) filterQuery.category = category;
    if (jobType) filterQuery.jobType = jobType;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // 🔹 1. Try with filters
    let jobs = await Job.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("createdBy", "companyName");

    let usedFallback = false;

    // 🔥 2. If no jobs → fallback to all jobs
    if (!jobs.length) {
      usedFallback = true;

      jobs = await Job.find(baseQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("createdBy", "companyName");
    }

    const totalJobs = await Job.countDocuments(
      jobs.length && !usedFallback ? filterQuery : baseQuery,
    );

    // 🔹 Transform response
    const formattedJobs = jobs.map((job) => ({
      id: job._id,
      title: job.title,
      location: job.location,
      jobType: job.jobType,
      requirements: job.requirements || [],
      skills: job.skills || [],
      isRemote: job.isRemote,
      companyName: job.createdBy?.companyName || "N/A",
      salary: {
        min: job.salary?.min,
        max: job.salary?.max,
        currency: job.salary?.currency,
      },
    }));

    // 🔹 Category count (based on baseQuery or filterQuery)
    const categoryCounts = await Job.aggregate([
      {
        $match: usedFallback ? baseQuery : filterQuery,
      },
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
      fallbackUsed: usedFallback, // 👈 optional (good for frontend UX)
      totalJobs,
      currentPage: pageNum,
      totalPages: Math.ceil(totalJobs / limitNum),
      jobs: formattedJobs,
      categoryCounts,
    });
  } catch (err) {
    // console.error("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = getAllJobs;
