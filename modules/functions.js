const Discord = require("discord.js");

module.exports.getDuration = ts => {
	var baseStr, endStr;
	var cTime = new Date();
	if (isNaN(ts) || !ts) {
		throw "Invalid time provided or was not given"
	}
	var tDiff = Math.abs((Number(cTime) - ts) / 1000);
	if (Number(cTime) > Number(ts)) {
		endStr = "ago";
	} else {
		endStr = "left";
	}
	if (tDiff < 60) {
		baseStr = (Math.round(tDiff * 10) / 10) + " seconds"
	} else if (tDiff < 3600) {
		baseStr = Math.floor(tDiff / 60) + " minutes and " + Math.round(tDiff % 60) + " seconds"
	} else if (tDiff < 86400) {
		baseStr = Math.floor(tDiff / 3600) + " hours and " + Math.floor((tDiff % 3600) / 60) + " minutes"
	} else if (tDiff < 2592000) {
		baseStr = Math.floor(tDiff / 86400) + " days and " + Math.floor((tDiff % 86400) / 3600) + " hours"
	} else {
		var yDif = cTime.getYear() - ts.getYear();
		var mDif = cTime.getMonth() - ts.getMonth();
		var dDif = cTime.getDate() - ts.getDate();
		if ((mDif == 0 && dDif < 0) || mDif < 0) {
			yDif--;
			mDif += 12;
		}
		if (dDif < 0) {
			mDif--;
			dDif += 30;
		}
		if (tDiff < 31536000) {
			baseStr = mDif + " months and " + dDif + " days"
		} else {
			baseStr = yDif + " years and " + mDif + " months"
		}
	}
	return baseStr + " " + endStr;
}

module.exports.findMember = (msg, str) => {
	let member;
	if (!msg.mentions.users.first()) {
		member = msg.guild.members.get(str);
	} else {
		member = msg.guild.members.get(msg.mentions.users.first().id);
	}
	if (!member) {
		let sMem = msg.guild.members.find(mem => mem.user.tag.toLowerCase().includes(str.toLowerCase()));
		if (!sMem) sMem = msg.guild.members.find(mem => mem.user.username.toLowerCase().includes(str.toLowerCase()));
		if (!sMem) sMem = msg.guild.members.find(mem => mem.displayName.toLowerCase().includes(str.toLowerCase()));
		if (!sMem) {
			return undefined;
		} else {
			member = sMem;
		}
	}
	return member;
}