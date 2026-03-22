const Class = require('../../models/Class');

const joinClass = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const studentEmail = req.user.email;
    const studentId    = req.user._id;

    // ✅ 1. Validate input
    if (!joinCode || joinCode.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Join code is required"
      });
    }

    // ✅ 2. Only student can join
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: "Only students can join a class"
      });
    }

    // ✅ 3. Find class by joinCode
    const cls = await Class.findOne({ joinCode: joinCode.trim().toUpperCase() });
    if (!cls) {
      return res.status(404).json({
        success: false,
        message: "Invalid join code — class not found"
      });
    }

    // ✅ 4. Check class is not archived
    if (cls.isArchived) {
      return res.status(400).json({
        success: false,
        message: "This class is archived and no longer accepting students"
      });
    }

    // ✅ 5. Check student is whitelisted
    if (!cls.allowedEmails.includes(studentEmail)) {
      return res.status(403).json({
        success: false,
        message: "You are not invited to this class. Contact your teacher."
      });
    }

    // ✅ 6. Check already joined
    const alreadyJoined = cls.students.some(
      id => id.toString() === studentId.toString()
    );
    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: "You have already joined this class"
      });
    }

    // ✅ 7. Add student to class
    cls.students.push(studentId);

    // ✅ 8. Update invite status to accepted
    const invite = cls.invites.find(i => i.email === studentEmail);
    if (invite) invite.status = 'accepted';

    await cls.save();

    // ✅ 9. Return class details
    const populated = await cls.populate('teacher', 'name email');

    res.status(200).json({
      success: true,
      message: "Successfully joined the class!",
      class: {
        _id:        populated._id,
        name:       populated.name,
        section:    populated.section,
        subject:    populated.subject,
        coverColor: populated.coverColor,
        joinCode:   populated.joinCode,
        teacher:    populated.teacher,
        totalStudents: populated.students.length,
      }
    });

  } catch (error) {
    console.error("joinClass error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { joinClass };