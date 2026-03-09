const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { generateTokens } = require('./generateTokens');

const isProduction = process.env.NODE_ENV === 'production';

const issueAccessTokenFromRefresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new Error('NO_REFRESH_TOKEN');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  // ✅ Compare hashed refresh token stored in DB
  const hashedIncoming = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  if (user.refreshToken !== hashedIncoming) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  // ✅ Rotate tokens — generate brand new pair
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    generateTokens(user._id, user.role);

  // ✅ Hash new refresh token before saving
  user.refreshToken = crypto
    .createHash('sha256')
    .update(newRefreshToken)
    .digest('hex');
  await user.save();

  // ✅ Set new cookies
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };

  res.cookie('accessToken', newAccessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', newRefreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return user;
};

module.exports = issueAccessTokenFromRefresh;