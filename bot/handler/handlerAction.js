const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
  const handlerEvents = require("./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

  async function handleAntiReact(event, api, message) {
    const { config } = global.GoatBot;
    const { antiReact, reactUnsend } = config;

    const { reaction, userID, messageID: reactMessageID, threadID, senderID } = event;
    if (!reactMessageID)
      return;
    if (!userID || userID === 0 || userID === '0')
      return;
    if (!reaction)
      return;

    // Skip if this is a command reaction (onReaction system handles it)
    const { onReaction } = global.GoatBot;
    const reactionData = onReaction.get(reactMessageID);
    if (reactionData)
      return;

    const isUserAdmin = global.utils.isAdmin(userID);

    // Thread approval check — applies to both reactUnsend and antiReact
    const { threadApproval } = config;
    if (threadApproval && threadApproval.enable) {
      try {
        const threadData = await threadsData.get(threadID);
        if (threadData.approved !== true && !isUserAdmin)
          return;
      } catch (err) {}
    }

    // ─────────────────────────────────────────────────────────────────
    // REACT UNSEND  (config.reactUnsend)
    // FIXED: Old code only read config.antiReact.reactByUnsend — a
    // completely different key. config.reactUnsend was never checked,
    // so emoji-unsend never triggered. Now handled independently.
    // ─────────────────────────────────────────────────────────────────
    if (reactUnsend && reactUnsend.enable && Array.isArray(reactUnsend.emojis) && reactUnsend.emojis.includes(reaction)) {
      const canTrigger = !reactUnsend.onlyAdmin || isUserAdmin;
      if (!canTrigger)
        return;

      try {
        const botID = api.getCurrentUserID();

        if (event.isE2EE) {
          const e2eeJid = global._e2eeMessageMap && global._e2eeMessageMap.get(String(reactMessageID));
          if (e2eeJid) {
            await api.unsendMessage(reactMessageID).catch(() => {});
            global.utils.log.info("REACT UNSEND", `${userID} triggered unsend on E2EE message ${reactMessageID}`);
          }
        } else {
          const messageInfo = await api.getMessage(threadID, reactMessageID);
          if (messageInfo && messageInfo.senderID === botID) {
            await api.unsendMessage(reactMessageID);
            global.utils.log.info("REACT UNSEND", `${userID} unsent bot message ${reactMessageID} in ${threadID}`);
          }
        }
      } catch (err) {
        if (!err.message?.includes('field_exception') && !err.message?.includes('Query error') && !err.message?.includes('Cannot retrieve message')) {
          global.utils.log.warn("REACT UNSEND", `Failed for message ${reactMessageID}: ${err.message}`);
        }
      }
      return; // Don't fall through to antiReact
    }

    // ─────────────────────────────────────────────────────────────────
    // ANTI REACT  (config.antiReact)  — unchanged legacy path
    // ─────────────────────────────────────────────────────────────────
    if (!antiReact || !antiReact.enable)
      return;

    const isAdminBot = antiReact.onlyAdminBot ? isUserAdmin : true;

    try {
      if (antiReact.reactByRemove.enable && reaction === antiReact.reactByRemove.emoji) {
        if (!isAdminBot) {
          const userInfo = await api.getUserInfo(userID);
          const reactorName = userInfo[userID].name;
          message.send(`Hey, ${reactorName}, \n\nthis isn't for you😡`);
          return;
        }
        if (senderID && senderID !== api.getCurrentUserID()) {
          await api.removeUserFromGroup(senderID, threadID);
          global.utils.log.info("ANTI REACT", `Admin ${userID} kicked user ${senderID} from group ${threadID}`);
        }
        return;
      }

      if (antiReact.reactByUnsend.enable && antiReact.reactByUnsend.emojis.includes(reaction)) {
        if (!isAdminBot)
          return;

        const botID = api.getCurrentUserID();

        if (event.isE2EE) {
          const e2eeJid = global._e2eeMessageMap && global._e2eeMessageMap.get(String(reactMessageID));
          if (e2eeJid) {
            await api.unsendMessage(reactMessageID).catch(() => {});
            global.utils.log.info("ANTI REACT", `Admin ${userID} unsent E2EE bot message ${reactMessageID}`);
          }
          return;
        }

        const messageInfo = await api.getMessage(threadID, reactMessageID);
        if (messageInfo && messageInfo.senderID === botID) {
          await api.unsendMessage(reactMessageID);
          global.utils.log.info("ANTI REACT", `Admin ${userID} unsent bot message ${reactMessageID}`);
        }
      }
    } catch (err) {
      if (!err.message?.includes('field_exception') && !err.message?.includes('Query error') && !err.message?.includes('Cannot retrieve message')) {
        global.utils.log.warn("ANTI REACT", `Failed to process anti-react for message ${reactMessageID}:`, err.message);
      }
    }
  }

  return async function (event) {
    if (!event.isE2EE) {
      if (
        global.GoatBot.config.antiInbox == true &&
        (event.senderID == event.threadID || event.userID == event.senderID || event.isGroup == false) &&
        (event.senderID || event.userID || event.isGroup == false)
      )
        return;
    }

    const message = createFuncMessage(api, event);

    await handlerCheckDB(usersData, threadsData, event);
    const handlerChat = await handlerEvents(event, message);
    if (!handlerChat)
      return;

    const {
      onAnyEvent, onFirstChat, onStart, onChat,
      onReply, onEvent, handlerEvent, onReaction,
      typ, presence, read_receipt
    } = handlerChat;

    if (typeof onAnyEvent === 'function')
      onAnyEvent();

    switch (event.type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        onFirstChat();
        onChat();
        onStart();
        onReply();
        break;
      case "e2ee_message":
      case "e2ee_message_edit":
        onStart();
        onReply();
        break;
      case "e2ee_message_reaction":
        onReaction();
        await handleAntiReact(event, api, message);
        break;
      case "event":
        handlerEvent();
        onEvent();
        break;
      case "message_reaction":
        onReaction();
        await handleAntiReact(event, api, message);
        break;
      case "typ":
        typ();
        break;
      case "presence":
        presence();
        break;
      case "read_receipt":
        read_receipt();
        break;
    }
  };
};
