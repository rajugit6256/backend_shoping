const jwt = require("jsonwebtoken");
const User = require("../models/User");

const issueAccessTokenFromRefresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log(refreshToken, "this is refresh token");

  // ❌ DO NOT send response
  if (!refreshToken) {
    throw new Error("NO_REFRESH_TOKEN");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user || user.refreshToken !== refreshToken) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  // ✅ Generate new access token
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  // ✅ Setting cookies is OK
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  });

  // ✅ ONLY return data
  return user;
};

module.exports = issueAccessTokenFromRefresh;
