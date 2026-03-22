// controller/Classes/getClasses.js
const Class = require('../../models/Class');

const getClasses = async (req, res) => {
  try {
    const userId   = req.user._id;
    const userRole = req.user.role;

    let classes = [];

    if (userRole === 'teacher') {

      // ✅ Teacher — get all classes they created
      classes = await Class.find({ teacher: userId })
        .populate('teacher', 'name email')
        .select('-allowedEmails -invites') // hide sensitive data
        .sort({ createdAt: -1 }); // newest first

      return res.status(200).json({
        success: true,
        message: `You have ${classes.length} class(es)`,
        role:    'teacher',
        total:   classes.length,
        classes: classes.map(cls => ({
          _id:           cls._id,
          name:          cls.name,
          section:       cls.section,
          subject:       cls.subject,
          coverColor:    cls.coverColor,
          joinCode:      cls.joinCode,
          isArchived:    cls.isArchived,
          totalStudents: cls.students.length,
          teacher: {
            name:  cls.teacher.name,
            email: cls.teacher.email,
          },
          createdAt: cls.createdAt,
        }))
      });

    } else if (userRole === 'student') {

      // ✅ Student — get all classes they joined
      classes = await Class.find({ students: userId })
        .populate('teacher', 'name email')
        .select('-allowedEmails -invites') // hide sensitive data
        .sort({ createdAt: -1 }); // newest first

      return res.status(200).json({
        success: true,
        message: `You are enrolled in ${classes.length} class(es)`,
        role:    'student',
        total:   classes.length,
        classes: classes.map(cls => ({
          _id:           cls._id,
          name:          cls.name,
          section:       cls.section,
          subject:       cls.subject,
          coverColor:    cls.coverColor,
          joinCode:      cls.joinCode,
          isArchived:    cls.isArchived,
          totalStudents: cls.students.length,
          teacher: {
            name:  cls.teacher.name,
            email: cls.teacher.email,
          },
          createdAt: cls.createdAt,
        }))
      });

    } else {
      return res.status(403).json({
        success: false,
        message: "Invalid role"
      });
    }

  } catch (error) {
    console.error("getClasses error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { getClasses };