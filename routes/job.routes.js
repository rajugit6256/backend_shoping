// routes/job.routes.js

const express = require("express");
const router = express.Router();

const ctrl = require("../controller/job/job.controller");
const allJobCtrl = require("../controller/Job/AllJon");
const isAdminAuth = require("../Middleware/isAdminAuth");
const authMiddleware = require('../Middleware/authentication');

// Admin-only routes
router.post("/jobs-create", authMiddleware, isAdminAuth, ctrl.createJob);
router.get("/jobs", authMiddleware, allJobCtrl);



module.exports = router;
