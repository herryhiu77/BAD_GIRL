/**
 * @license
 * Facebook Messenger Bot - 'inbox' Command
 * Clean, lightweight, fully optimized & crash-proof.
 * 
 * Command Name: inbox
 * Role: 0 (Everyone can use this)
 * Cooldown: 5 seconds
 */

module.exports.config = {
  name: "inbox",
  version: "1.0.3",
  hasPermssion: 0, // Role: 0 (Everyone)
  credits: "Professional Developer",
  description: "Send a direct message (DM) to the user's Messenger Inbox",
  commandCategory: "utility",
  usages: "inbox",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  
  // Basic crash-proofing check
  if (!api || !event) return;

  try {
    // ১. ইউজারের নাম পাওয়ার চেষ্টা করা হচ্ছে
    let userName = "User";
    try {
      const userInfo = await api.getUserInfo(senderID);
      if (userInfo && userInfo[senderID]) {
        userName = userInfo[senderID].name || "User";
      }
    } catch (userInfoError) {
      // ইউজার ইনফো না পেলেও বট ক্র্যাশ করবে না, fallback নাম ব্যবহার করবে
      console.warn("Could not retrieve user info: " + userInfoError.message);
    }

    // ২. ইনবক্সে পাঠানোর জন্য সুন্দর ডিএম টেক্সট
    const dmMessage = `👋 হ্যালো ${userName}!\n\nআপনি গ্রুপ চ্যাটে বট থেকে একটি সরাসরি মেসেজ অনুরোধ করেছেন।\n\n⚙️ আপনার Sender ID: ${senderID}\n⏰ সময়: ${new Date().toLocaleTimeString()}\n\nআমাদের বট সার্ভিসটি ব্যবহার করার জন্য আপনাকে ধন্যবাদ! আপনার কোনো সাহায্য লাগলে আমাদের জানাবেন।`;

    // ৩. ইউজারের ইনবক্সে সরাসরি মেসেজ পাঠানো হচ্ছে
    await api.sendMessage(dmMessage, senderID);

    // ৪. মেসেজ সফলভাবে পাঠানো হলে গ্রুপে রিপ্লাই দেওয়া হচ্ছে
    const successMessage = `✅ @${userName}, আমি আপনার ইনবক্সে একটি সরাসরি মেসেজ (DM) পাঠিয়েছি! অনুগ্রহ করে আপনার Message Requests অথবা Spam ফোল্ডার চেক করুন।`;
    return api.sendMessage(successMessage, threadID, messageID);

  } catch (error) {
    console.error("Error in inbox command:", error);

    // ৫. স্মার্ট বাইপাস মেকানিজম (যদি মেসেজ না যায়)
    // ফেসবুক সিকিউরিটি এবং প্রাইভেসি সেটিংসের কারণে প্রথম মেসেজ অনেক সময় ব্লক হয়।
    // ক্র্যাশ এড়াতে ক্যাচ ব্লকের সাহায্যে ইউজারকে সরাসরি বট ইনবক্স লিংক দেওয়া হবে।
    let botID = "";
    try {
      botID = api.getCurrentUserID();
    } catch (idErr) {
      botID = ""; // Fallback
    }

    let errorMessage = `❌ @${userName || "ইউজার"}, আমি আপনাকে সরাসরি মেসেজ পাঠাতে পারিনি। ফেসবুক প্রাইভেসি নিয়মের কারণে বট নিজে থেকে প্রথম মেসেজ পাঠাতে বাধা পেতে পারে।`;
    
    // ম.মে (m.me) ইনবক্স বাইপাস লিংক সংযুক্ত করা হচ্ছে
    if (botID) {
      errorMessage += `\n\n💡 𝗕𝘆𝗽𝗮𝘀𝘀 𝗧𝗶𝗽: এই সমস্যা সমাধান করতে অনুগ্রহ করে নিচের লিংকে ক্লিক করে আমাদের বটকে অন্তত একটি মেসেজ (যেমন: "hello") পাঠান, তারপর আবার /inbox ট্রাই করুন!\n🔗 https://m.me/${botID}`;
    } else {
      errorMessage += `\n\n💡 𝗕𝘆𝗽𝗮𝘀𝘀 𝗧𝗶𝗽: দয়া করে বটের প্রোফাইলে গিয়ে মেসেজ বাটনে ক্লিক করে একটি "hello" মেসেজ পাঠিয়ে ইনবক্স আনলক করুন, তারপর গ্রুপে আবার কমান্ড দিন।`;
    }

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};
