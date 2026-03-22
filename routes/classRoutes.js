const express = require("express");
const router = express.Router();

const createClass = require("../controller/Classes/create");
const { joinClass } = require("../controller/Classes/classesjoin");
const authMiddleware = require("../Middleware/authentication");

const upload = require("../utils/multer");
const { inviteByCSV } = require("../controller/Classes/inviteByCSV");
const { getClasses } = require("../controller/Classes/getClasses");

router.get("/my-classes", authMiddleware, getClasses);
router.post(
  "/:id/invite-csv",
  authMiddleware,
  upload.single("file"),
  inviteByCSV,
);

router.post("/create-class", authMiddleware, createClass);
router.post("/join-class", authMiddleware, joinClass);

module.exports = router;
