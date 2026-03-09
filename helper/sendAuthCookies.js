const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,                      // ✅ false on localhost, true in production
  sameSite: isProduction ? 'none' : 'lax',   // ✅ 'none' required for cross-origin in prod
};

const sendAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,                  // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 days
  });
};

module.exports = { sendAuthCookies };