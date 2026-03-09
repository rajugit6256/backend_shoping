const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isProduction = process.env.NODE_ENV === 'production';

const cookieClearOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // Always clear cookies regardless of token state
    res.clearCookie('accessToken', cookieClearOptions);
    res.clearCookie('refreshToken', cookieClearOptions);

    if (!refreshToken) {
      return res.status(200).json({ success: true, message: 'Logged out' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      // Token invalid/expired — cookies already cleared, still success
      return res.status(200).json({ success: true, message: 'Logged out' });
    }

    // Remove refresh token from DB
    const user = await User.findById(decoded.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    return res.status(200).json({ success: true, message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = logout;