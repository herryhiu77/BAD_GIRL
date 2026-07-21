/**
 * @license
 * Facebook Messenger Bot – inbox command
 * Sends a direct message “Hello Baby, How Are You?” to the user’s Messenger inbox
 * whenever the command is invoked from any chat (group or private).
 */

module.exports.config = {
  name: "inbox",
  version: "1.0.6",
  role: 0, // everyone can use
  credits: "Professional Developer",
  description: "Send a direct message to the user’s Messenger inbox",
  category: "utility",
  usages: "inbox",
  cooldowns: 5
};

module.exports.onStart = async function({ api, event, message }) {
  const { senderID } = event;

  if (!api || !event) return;

  try {
    // 1. Prepare the message that will go to the user’s inbox
    const dmMessage = "Hello Baby, How Are You?";

    // 2. Send the message directly to the user’s inbox
    await api.sendMessage(dmMessage, senderID);

    // 3. Reply in the current chat to confirm the action
    const reply = `✅ I’ve just sent “Hello Baby, How Are You?” to your Messenger inbox.`;
    return message.reply(reply);
  } catch (err) {
    console.error("Error while sending inbox message:", err);

    // 4. Fallback reply if anything goes wrong
    const errorReply =
      "❌ I couldn’t send the message to your inbox. Please try again later.";
    return message.reply(errorReply);
  }
};
