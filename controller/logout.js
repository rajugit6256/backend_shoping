const jwt = require("jsonwebtoken");
const User = require("../models/User");

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // No refresh token
    if (!refreshToken) {
      return res.status(200).json({
        success: true,
        token: "Token not found",
        message: "Logged out",
      });
    }

    // Decode refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find user
    const user = await User.findById(decoded.id);

    if (user) {
      user.refreshToken = null; // Remove from DB
      await user.save();
    }

    // Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = logout;
