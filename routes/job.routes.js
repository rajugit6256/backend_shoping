// routes/job.routes.js

const express = require("express");
const router = express.Router();

const ctrl = require("../controller/job/job.controller");
const allJobCtrl = require("../controller/Job/AllJon");
const updateJobCtrl = require("../controller/Job/updateJob");
const isAdminAuth = require("../Middleware/isAdminAuth");
const getMyJobs = require("../controller/Job/getMyJobs");
const authMiddleware = require("../Middleware/authentication");
const deleteJob = require("../controller/Job/deleteJob");
const updateStatus = require("../controller/Job/updateJobStatus");

// Admin-only routes
router.post("/jobs-create", authMiddleware, isAdminAuth, ctrl.createJob);
router.get("/jobs/my", authMiddleware, isAdminAuth, getMyJobs);
router.put("/jobs/:id", authMiddleware, isAdminAuth, updateJobCtrl);
router.delete("/jobs/:id", authMiddleware, isAdminAuth, deleteJob);
router.patch("/jobs/:id/status", authMiddleware, isAdminAuth, updateStatus);

//both user and admin can access
router.get("/jobs", authMiddleware, allJobCtrl);

module.exports = router;
