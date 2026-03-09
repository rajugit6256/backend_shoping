// ✅ Clean and correct — no changes needed structurally
// authMiddleware sets req.user before this runs

const profile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = profile;