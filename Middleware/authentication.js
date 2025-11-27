const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret';

function authenticate(req, res, next) {
  // Get token from cookies
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'No token, access denied' });
  }

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // attach user payload to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = authenticate;
