const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// ✅ Auto-create uploads folder if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads', { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

module.exports = multer({ storage, fileFilter });
