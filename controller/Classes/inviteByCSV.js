// controller/Classes/inviteByCSV.js
const fs = require("fs");
const Class = require("../../models/Class");
const User = require("../../models/User");
const { parseEmailsFromCSV } = require("../../utils/parseCSV");

const inviteByCSV = async (req, res) => {
  try {
    // ✅ Check file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CSV file",
      });
    }

    const filePath = req.file.path;
    const classId = req.params.id;

    // ✅ Only teacher can invite
    if (req.user.role !== "teacher") {
      fs.unlinkSync(filePath); // cleanup file
      return res.status(403).json({
        success: false,
        message: "Only teachers can invite students",
      });
    }

    // ✅ Find class and verify ownership
    const cls = await Class.findById(classId);
    if (!cls) {
      fs.unlinkSync(filePath); // cleanup file
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    if (cls.teacher.toString() !== req.user._id.toString()) {
      fs.unlinkSync(filePath); // cleanup file
      return res.status(403).json({
        success: false,
        message: "You don't own this class",
      });
    }

    // ✅ Parse CSV
    const { emails, errors: parseErrors } = await parseEmailsFromCSV(filePath);

    // ✅ Delete temp file after parsing
    fs.unlinkSync(filePath);

    if (emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid emails found in CSV",
        parseErrors,
      });
    }

    // ✅ Remove duplicates within CSV itself
    const uniqueEmails = [...new Set(emails)];

    const results = {
      invited: [], // ✅ newly invited
      alreadyInvited: [], // ⚠️ already in allowedEmails
      notRegistered: [], // ❌ email not in DB
      notStudent: [], // ❌ email exists but not student role
      invalidFormat: [], // ❌ bad email format
      parseErrors, // ❌ CSV row errors
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const email of uniqueEmails) {
      // ✅ 1. Validate email format
      if (!emailRegex.test(email)) {
        results.invalidFormat.push(email);
        continue;
      }

      // ✅ 2. Check already invited (handles multiple CSV uploads)
      if (cls.allowedEmails.includes(email)) {
        results.alreadyInvited.push(email);
        continue;
      }

      // ✅ 3. Check if user exists in DB
      const user = await User.findOne({ email });
      if (!user) {
        results.notRegistered.push(email);
        continue;
      }

      // ✅ 4. Check if user is a student
      if (user.role !== "student") {
        results.notStudent.push(email);
        continue;
      }

      // ✅ 5. All checks passed — invite student
      cls.allowedEmails.push(email);
      cls.invites.push({ email, status: "pending" });
      results.invited.push(email);
    }

    // ✅ Save updated class
    await cls.save();

    // ✅ Build helpful info messages for teacher
    const infoMessages = [];

    if (results.alreadyInvited.length > 0) {
      infoMessages.push(
        `${results.alreadyInvited.length} student(s) were already invited and skipped`,
      );
    }
    if (results.notRegistered.length > 0) {
      infoMessages.push(
        `${results.notRegistered.length} student(s) are not registered yet — ask them to register first, then upload again`,
      );
    }
    if (results.notStudent.length > 0) {
      infoMessages.push(
        `${results.notStudent.length} email(s) belong to non-student accounts and were blocked`,
      );
    }
    if (results.invalidFormat.length > 0) {
      infoMessages.push(
        `${results.invalidFormat.length} email(s) had invalid format and were skipped`,
      );
    }

    res.status(200).json({
      success: true,
      message:
        results.invited.length > 0
          ? `${results.invited.length} student(s) invited successfully`
          : "No new students were invited",
      summary: {
        total: uniqueEmails.length,
        invited: results.invited.length,
        alreadyInvited: results.alreadyInvited.length,
        notRegistered: results.notRegistered.length,
        notStudent: results.notStudent.length,
        invalidFormat: results.invalidFormat.length,
      },
      results,
      info: infoMessages,
    });
  } catch (error) {
    console.error("inviteByCSV error:", error);

    // ✅ Cleanup file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { inviteByCSV };
