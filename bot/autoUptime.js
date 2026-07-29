const axios = require('axios');
const { config } = global.GoatBot;
const { log, getText } = global.utils;

// Clear any existing uptime timer before starting a new one
if (global.timeOutUptime != undefined) {
	clearTimeout(global.timeOutUptime);
	clearInterval(global.timeOutUptime); // Clear interval too (backward compat)
	global.timeOutUptime = undefined;
}

if (!config.autoUptime.enable)
	return;

const PORT = config.dashBoard?.port || (!isNaN(config.serverUptime?.port) && config.serverUptime.port) || 3001;

let myUrl = config.autoUptime.url || `https://${
	process.env.REPL_OWNER
		? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
		: process.env.API_SERVER_EXTERNAL == "https://api.glitch.com"
			? `${process.env.PROJECT_DOMAIN}.glitch.me`
			: `localhost:${PORT}`
}`;
myUrl.includes('localhost') && (myUrl = myUrl.replace('https', 'http'));
myUrl += '/uptime';

// FIXED: intervalMs in milliseconds (timeInterval is in seconds)
const intervalMs = (config.autoUptime.timeInterval || 180) * 1000;

let status = 'ok';

// FIXED: Use recursive setTimeout — the old code called setInterval inside
// the callback on every tick, creating a new leaked interval each time.
// After 6-7 hours this spawned thousands of simultaneous requests → crash.
async function autoUptimeCheck() {
	try {
		await axios.get(myUrl, { timeout: 10000 });
		if (status != 'ok') {
			status = 'ok';
			log.info("UPTIME", "Bot is back online ✅");
		}
	}
	catch (e) {
		const err = e.response?.data || e;
		if (status == 'ok') {
			status = 'failed';
			if (err.statusAccountBot == "can't login") {
				log.err("UPTIME", "Can't login account bot");
			}
			else if (err.statusAccountBot == "block spam") {
				log.err("UPTIME", "Your account is blocked");
			}
			else {
				log.warn("UPTIME", "Uptime check failed — will retry next cycle");
			}
		}
	}
	// Schedule next check — single setTimeout, no accumulation
	global.timeOutUptime = setTimeout(autoUptimeCheck, intervalMs);
}

global.timeOutUptime = setTimeout(autoUptimeCheck, intervalMs);
log.info("AUTO UPTIME", getText("autoUptime", "autoUptimeTurnedOn", myUrl));
