const profile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      status: true,
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = profile;
