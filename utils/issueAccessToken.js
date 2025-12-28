const jwt = require("jsonwebtoken");
const User = require("../models/User");

const issueAccessTokenFromRefresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log(refreshToken,"this is refresh token")

    if (!refreshToken) {
      return res.status(401).json(
        {
         success: false
        , message:" No refresh token provided"
       }
      );
    }

  // Verify refresh token
  const decoded = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  // Find user & validate stored refresh token
  const user = await User.findById(decoded.id).select("-password");

  if (!user || user.refreshToken !== refreshToken) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  // Generate new access token
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  // Set cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  });

  return user;
};

module.exports = issueAccessTokenFromRefresh;
