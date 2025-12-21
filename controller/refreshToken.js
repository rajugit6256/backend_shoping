const jwt = require("jsonwebtoken");
const User = require("../models/User");

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json(
        {
         success: false
        , message:" No refresh token provided"
       }
      );
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
         success: false,
         message:" Invalid refresh token"
        });
    }
    // ✅ GENERATE NEW ACCESS TOKEN
    const accessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    // ✅ SET ACCESS TOKEN AS HTTP-ONLY COOKIE
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(403).json({ success: false });
  }
};

module.exports = refreshAccessToken;
