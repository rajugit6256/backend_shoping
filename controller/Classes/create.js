const Class = require('../../models/Class');
const { nanoid } = require('nanoid'); // npm install nanoid

// ✅ Guaranteed unique — retries only if DB throws duplicate error
const generateJoinCode = () => {
  return nanoid(6).toUpperCase(); // e.g. "X7KP2A"
};

const createClass = async (req, res) => {
  try {
    const { name, section, subject, coverColor } = req.body;

    // ✅ Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: "Class name is required" });
    }

    // ✅ Only teacher can create
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: "Only teachers can create a class" });
    }

    let newClass;
    let attempts = 0;

    // ✅ Retry loop — only retries on REAL duplicate collision (extremely rare)
    while (!newClass && attempts < 5) {
      try {
        attempts++;
        const joinCode = generateJoinCode();

        newClass = await Class.create({
          name:       name.trim(),
          section:    section?.trim(),
          subject:    subject?.trim(),
          coverColor: coverColor || '#1967D2',
          joinCode,
          teacher:    req.user._id,
        });

      } catch (err) {
        // ✅ Only retry if it's a duplicate joinCode error
        if (err.code === 11000 && err.keyPattern?.joinCode) {
          console.warn(`Join code collision, retrying... attempt ${attempts}`);
          continue; // try again with new code
        }
        throw err; // other errors bubble up immediately
      }
    }

    if (!newClass) {
      return res.status(500).json({ message: "Failed to generate unique join code" });
    }

    // ✅ Populate teacher info
    const populated = await newClass.populate('teacher', 'name email');

    res.status(201).json({
      message: "Class created successfully",
      class:   populated
    });

  } catch (error) {
    console.error("createClass error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports =  createClass ;