module.exports.config = {
  name: "inbox",
  version: "1.0.9",
  role: 0, // 0 = Everyone can use
  credits: "HackerGPT",
  description: "Send a direct message to the user's inbox without clicking links.",
  category: "utility",
  usages: "inbox",
  cooldowns: 5
};

module.exports.onStart = async function({ api, event, message }) {
  const { senderID } = event; // The user who typed the command

  try {
    // Prepare the message text
    const msgText = "Hello Baby, How Are You?";

    // Send message directly using the bot's API object
    // This works without needing an external Access Token
    await api.sendMessage(
      msgText, 
      senderID // Sends specifically to the user who used the command
    );

    // Confirm success to the user
    return message.reply(`✅ Message sent successfully to your inbox!\n\n📩 "${msgText}"`);

  } catch (error) {
    console.error("Inbox Command Error:", error);
    
    // Fallback response if something goes wrong
    return message.reply(`❌ Failed to send message: ${error.message}`);
  }
};
