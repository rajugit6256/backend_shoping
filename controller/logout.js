const jwt = require("jsonwebtoken");
const User = require("../models/User");

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // Clear cookies in any case
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false, // change to true in production with HTTPS
      sameSite: "none",
      path: "/",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      path: "/",
    });

    // If no refresh token, return success
    if (!refreshToken) {
      return res.status(200).json({ success: true, message: "Logged out without refreshtoken" });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(200).json({ success: true, message: "Logged out" });
    }

    // Remove refreshToken from DB
    const user = await User.findById(decoded.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = logout;
