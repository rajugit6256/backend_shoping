const issueAccessTokenFromRefresh = require("../utils/issueAccessToken");
const jwt = require("jsonwebtoken");

const me = async (req, res) => {
  const accessToken = req.cookies.accessToken;
  console.log(accessToken, "this is me api");
  // 1️⃣ If access token exists → try it
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      return res.json({ id: decoded.id, role: decoded.role });
    } catch {
      // expired → continue
    }
  }

  // 2️⃣ Access token missing or expired → use refresh token
  try {
    const user = await issueAccessTokenFromRefresh(req, res);
    console.log(user, "user");
    return res.json({ id: user._id, role: user.role });
  } catch {
    // 3️⃣ Refresh token also invalid
    return res.status(401).json({ message: "Not logged in" });
  }
};

module.exports = me;
