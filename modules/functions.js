module.exports.getDuration = ts => {
	if (ts == undefined || isNaN(ts)) throw new Error("Invalid time provided or was not given");
	var baseStr, endStr;
	var cDate = new Date();
	var cTime = Number(cDate);
	var tsDate = new Date(ts);
	var tsTime = Number(ts);
	var tDif = Math.abs((cTime - tsTime) / 1000);
	if (cTime >= tsTime) {endStr = "ago"} else {endStr = "left"}
	if (tDif < 60) {
		baseStr = (Math.round(tDif * 10) / 10) + " seconds"
	} else if (tDif < 3600) {
		baseStr = Math.floor(tDif / 60) + " minutes and " + Math.floor(tDif % 60) + " seconds"
	} else if (tDif < 86400) {
		baseStr = Math.floor(tDif / 3600) + " hours and " + Math.floor((tDif % 3600) / 60) + " minutes"
	} else if (tDif < 2678400) {
		baseStr = Math.floor(tDif / 86400) + " days and " + Math.floor((tDif % 86400) / 3600) + " hours"
	} else {
		var yDif = cDate.getFullYear() - tsDate.getFullYear();
		var mDif = cDate.getMonth() - tsDate.getMonth();
		var dDif = cDate.getDate() - tsDate.getDate();
		if ((mDif == 0 && dDif < 0) || mDif < 0) {
			yDif--;
			mDif += 12;
		}
		if (dDif < 0) {
			mDif--;
			dDif += 30;
		}
		if (yDif == 0) {
			baseStr = mDif + " months and " + dDif + " days"
		} else {
			baseStr = yDif + " years and " + mDif + " months"
		}
	}
	return baseStr + " " + endStr;
}

module.exports.findMember = (bot, msg, str) => {
	let member;
	msg.mentions.members.forEach(mem => {
		if (mem.id != bot.user.id) member = mem;
	})
	if (!member) {
		member = msg.guild.members.get(str);
		if (!member) member = msg.guild.members.find(mem => mem.user.tag.toLowerCase().includes(str.toLowerCase()));
		if (!member) member = msg.guild.members.find(mem => mem.user.username.toLowerCase().includes(str.toLowerCase()));
		if (!member) member = msg.guild.members.find(mem => mem.displayName.toLowerCase().includes(str.toLowerCase()));
		if (!member) return undefined;
	}
	return member;
}
