module.exports.config = {
  name: "inbox",
  version: "1.1.0",
  role: 0,
  credits: "Riyad + ChatGPT",
  description: "Send a message to the command sender (debug version).",
  category: "utility",
  usages: "inbox",
  cooldowns: 5
};

module.exports.onStart = async function ({ api, event, message }) {
  const { senderID } = event;
  const text = "Hello Baby, How Are You?";

  try {
    api.sendMessage(text, senderID, (err, info) => {
      if (err) {
        console.error("❌ sendMessage Error:", err);

        return message.reply(
          "❌ Message send failed.\n\n" +
          (err.errorDescription || err.message || JSON.stringify(err))
        );
      }

      console.log("✅ sendMessage Info:", info);

      return message.reply(
        `✅ Message sent successfully!\n\n` +
        `📩 ${text}\n\n` +
        `Message ID: ${info?.messageID || "Unknown"}`
      );
    });

  } catch (e) {
    console.error(e);
    return message.reply(
      "❌ Error:\n" + (e.message || String(e))
    );
  }
};
