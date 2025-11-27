const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generateTokens } = require("../utils/generateTokens");
const { sendAuthCookies } = require("../helper/sendAuthCookies");

 const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. User must be verified
    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email to login" });
    }

    // 3. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 4. Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    user.refreshToken = refreshToken;
    await user.save();

    // 5. Send tokens in secure cookies
    sendAuthCookies(res, accessToken, refreshToken);

    // 6. Send response
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = loginUser;