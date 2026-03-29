const axios = require("axios");

const DISCORD_WEBHOOK_URL = process.env.WEBHOOK_URL;

const sendDiscordNotification = async (data,type) => {
  try {
    await axios.post(DISCORD_WEBHOOK_URL, {
      username: type,
      embeds: [
        {
          title: "🆕 New User Registered",
          color: 5763719,
          fields: [
            { name: "Name", value: data.name || "N/A", inline: true },
            { name: "Email", value: data.email, inline: true },
            { name: "Phone", value: data.phone, inline: true },
            { name: "Role", value: data.role, inline: true },
          ],
          timestamp: new Date(),
        },
      ],
    });
  } catch (err) {
    console.error("Discord notification failed:", err.message);
  }
};

module.exports = { sendDiscordNotification };