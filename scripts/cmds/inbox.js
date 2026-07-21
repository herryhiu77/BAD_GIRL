/**
 * @license
 * Facebook Messenger Bot - 'inbox' Command
 * Supported by Goatbot / Goatbot-V2 / Mirai / FCA Frameworks
 * Clean, lightweight, fully optimized & crash-proof.
 * 100% Production Ready with Smart Bypass & Message Request Delivery Support.
 */

module.exports.config = {
  name: "inbox",
  version: "1.0.5",
  role: 0, // সবাই এই কমান্ড ব্যবহার করতে পারবে
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
    // ১. ইউজার প্রোফাইল থেকে নাম বের করার চেষ্টা (Personalization)
    let userName = "User";
    try {
      const userInfo = await api.getUserInfo(senderID);
      if (userInfo && userInfo[senderID]) {
        userName = userInfo[senderID].name || "User";
      }
    } catch (userInfoError) {
      console.warn("Could not retrieve user info: " + userInfoError.message);
    }

    // ২. ইনবক্সে পাঠানোর জন্য আকর্ষণীয় ও প্রফেশনাল মেসেজ ফরম্যাট
    const dmMessage = `👋 প্রিয় ${userName}!

আপনি আমাদের গ্রুপ চ্যাট থেকে সরাসরি ইনবক্সে মেসেজ করার অনুরোধ করেছেন।

⚙️ আপনার তথ্য:
👤 নাম: ${userName}
🆔 ইউজার আইডি: ${senderID}
⏰ সময়: ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}

🤖 বটের সাথে সংযুক্ত থাকার জন্য ধন্যবাদ! কোনো সাহায্য লাগলে সরাসরি এই ইনবক্সে লিখে জানাতে পারেন।`;

    // ৩. মেসেজ সরাসরি ইউজারের ইনবক্সে সেন্ড করার চেষ্টা
    // ফেসবুকের নিয়ম অনুযায়ী ব্যবহারকারী আগে মেসেজ না দিয়ে থাকলে এটি মেসেজ রিকোয়েস্ট (Message Requests) এ যাবে।
    await api.sendMessage(dmMessage, senderID);

    // ৪. গ্রুপে সফলতার বার্তা পাঠানো (ইউজারকে গাইড সহ যাতে মেসেজ রিকোয়েস্ট চেক করে)
    const successMsg = `✅ @${userName}, আমি আপনার ইনবক্সে মেসেজ পাঠিয়েছি!\n\n💡 গুরুত্বপূর্ণ তথ্য:\nআপনি যদি আগে কখনো বটের সাথে চ্যাট না করে থাকেন, তবে মেসেজটি আপনার "Message Requests" (মেসেজ রিকোয়েস্ট) অথবা "Spam" (স্প্যাম) ফোল্ডারে জমা হয়েছে। দয়া করে আপনার মেসেঞ্জার ওপেন করে রিকোয়েস্ট অপশনটি চেক করুন এবং চ্যাট চালু করতে Accept করুন।`;

    return message.reply(successMsg);

  } catch (error) {
    console.error("Error in inbox command:", error);

    // ইরর হ্যান্ডেলিং এর জন্য পুনরায় নাম সংগ্রহের চেষ্টা
    let userName = "User";
    try {
      const userInfo = await api.getUserInfo(senderID);
      if (userInfo && userInfo[senderID]) userName = userInfo[senderID].name;
    } catch (e) {}

    // ৫. স্মার্ট বাইপাস মেকানিজম (Smart Bypass Link)
    // ফেসবুক যদি সরাসরি রিকোয়েস্ট পাঠাতেও বাধা দেয় বা কোনো ব্লকিং থাকে, তবে বট ক্র্যাশ না করে এই সুন্দর সমাধানটি দেবে।
    let botID = "100067891234567";
    try {
      botID = api.getCurrentUserID() || botID;
    } catch (idErr) {}
    
    const errorMsg = `❌ দুঃখিত @${userName}, ফেসবুকের কড়া প্রাইভেসি পলিসির কারণে আমি সরাসরি আপনার ইনবক্সে প্রথম চ্যাটটি শুরু করতে পারছি না।\n\n💡 ১০০% কার্যকর বাইপাস ট্রিক:\nনিচের লিংকে ক্লিক করে আমাদের ইনবক্সে যেকোনো একটি মেসেজ (যেমন: "Hi") লিখে পাঠান। এর ফলে আমাদের ইনবক্স কানেকশন চালু হবে। তারপর আবার গ্রুপে এসে /inbox লিখলে সাথে সাথে মেসেজ চলে যাবে!\n\n🔗 সরাসরি মেসেজ লিংক: https://m.me/${botID}`;

    return message.reply(errorMsg);
  }
};
