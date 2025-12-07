const jwt = require('jsonwebtoken');

const navbar = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: "Not logged in" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.status(200).json({ role: decoded.role });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}


module.exports = navbar;