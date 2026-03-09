// ✅ Simplified — authMiddleware handles token verification
// req.user is already set by the time this runs
// Route in authRoutes.js: router.get('/me', authMiddleware, me)

const me = (req, res) => {
  const { _id, role, email } = req.user;
  return res.status(200).json({
    success: true,
    id: _id,
    role,
    email,
  });
};

module.exports = me;