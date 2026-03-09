const issueAccessTokenFromRefresh = require('../utils/issueAccessToken');

const refreshAccessToken = async (req, res) => {
  try {
    await issueAccessTokenFromRefresh(req, res);
    return res.status(200).json({ success: true, message: 'Token refreshed' });
  } catch (err) {
    // ✅ Distinguish between error types for easier frontend handling
    const message =
      err.message === 'NO_REFRESH_TOKEN' ? 'No session found' :
      err.message === 'INVALID_REFRESH_TOKEN' ? 'Session expired. Please log in again.' :
      'Server error';

    return res.status(401).json({ success: false, message });
  }
};

module.exports = refreshAccessToken;