/**
 * @license
 * Facebook Messenger Bot - 'inbox' Command
 * Supported by Goatbot / Goatbot-V2 Framework
 * Clean, lightweight, fully optimized & crash-proof.
 * Generated dynamically with premium support.
 */

module.exports.config = {
  name: "inbox",
  version: "1.0.3",
  role: 0,
  credits: "Professional Developer",
  description: "Send a direct message to user's messenger inbox",
  category: "utility",
  usages: "inbox",
  cooldowns: 5
};

module.exports.onStart = async function({ api, event, message }) {
  const { threadID, messageID, senderID } = event;
  
  if (!api || !event) return;

  try {
    // 1. Fetch user info for personalization
    let userName = "User";
    try {
      const userInfo = await api.getUserInfo(senderID);
      if (userInfo && userInfo[senderID]) {
        userName = userInfo[senderID].name || "User";
      }
    } catch (userInfoError) {
      console.warn("Could not retrieve user info: " + userInfoError.message);
    }

    // 2. Format custom DM Message with template variables
    const formattedDM = `👋 Hello {name}!

You requested a direct message from the bot in our group chat.

⚙️ Sender ID: {senderID}
⏰ Time: {time}

Thank you for using our service! Let me know if you need any other help.`
      .replace(/{name}/g, userName)
      .replace(/{senderID}/g, senderID)
      .replace(/{time}/g, new Date().toLocaleTimeString());

    // 3. Attempt to send DM directly to the sender's Inbox
    await api.sendMessage(formattedDM, senderID);

    // 4. Respond in group to confirm success
    const formattedSuccess = `✅ @{name}, I have sent a Direct Message (DM) to your inbox! Please check your Message Requests or Spam folders if you don't see it.`
      .replace(/{name}/g, userName)
      .replace(/{senderID}/g, senderID);

    return message.reply(formattedSuccess);

  } catch (error) {
    console.error("Error in inbox command:", error);

    // Format primary error message
    let userName = "User";
    try {
      const userInfo = await api.getUserInfo(senderID);
      if (userInfo && userInfo[senderID]) userName = userInfo[senderID].name;
    } catch (e) {}

    let errorText = `❌ @{name}, I couldn't send you a message directly. Facebook privacy rules restrict bots from initiating new conversations.`
      .replace(/{name}/g, userName)
      .replace(/{senderID}/g, senderID);

    // 5. SMART BYPASS LOGIC:
    // Generate helpful direct inbox link to bypass restrictions.
    let botID = "100067891234567";
    try {
      botID = api.getCurrentUserID() || botID;
    } catch (idErr) {}
    
    errorText += `\n\n💡 𝗕𝘆𝗽𝗮𝘀𝘀 𝗧𝗶𝗽:\nFacebook privacy rules prevent bots from sending messages out of nowhere. Click the link below to start a chat first, then try the command again!\n🔗 https://m.me/${botID}`;

    return message.reply(errorText);
  }
};
