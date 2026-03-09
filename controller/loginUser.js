const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateTokens } = require('../utils/generateTokens');
const { sendAuthCookies } = require('../helper/sendAuthCookies');

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 1. Find user
    const user = await User.findOne({ email });

    // ✅ Prevent user enumeration — always run bcrypt even if user not found
    const dummyHash = '$2b$10$invalidhashfortimingprotection00000000000000000000000';
    const passwordToCompare = user ? user.password : dummyHash;
    const isMatch = await bcrypt.compare(password, passwordToCompare);

    if (!user || !isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 2. User must be verified
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email to login' });
    }

    // 3. Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // ✅ Store hashed refresh token in DB
    user.refreshToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    await user.save();

    // 4. Send tokens in secure cookies
    sendAuthCookies(res, accessToken, refreshToken);

    // 5. Send safe response
    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = loginUser;