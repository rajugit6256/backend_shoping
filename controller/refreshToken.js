const issueAccessTokenFromRefresh = require("../utils/issueAccessToken");

const refreshAccessToken = async (req, res) => {
  try {
    await issueAccessTokenFromRefresh(req, res);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Session expired",
    });
  }
};




module.exports = refreshAccessToken;



