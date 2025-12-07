const jwt = require("jsonwebtoken");

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token missing" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ success: false, message: "Invalid refresh token" });
      }

      const accessToken = jwt.sign(
        { id: decoded.id, role: decoded.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      return res.status(200).json({
        success: true,
        accessToken,
      });
    });

  } catch (error) {
    console.log("Refresh error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = refreshAccessToken;
