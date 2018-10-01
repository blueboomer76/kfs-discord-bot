const Discord = require("discord.js");

module.exports = {
	capitalize: str => {
		str = str.toString();
		return str.charAt(0).toUpperCase() + str.slice(1);
	},
	getDuration: (time1, time2) => {
		if (!time1) throw new Error("Time 1 is required")
		if (isNaN(time1)) throw new Error("Time 1 is not a valid timestamp");
		if (time2 && isNaN(time2)) throw new Error("Time 2 is not a valid timestamp");
		
		let baseStr, endStr;
		time1 = new Date(time1);
		if (!time2) {time2 = new Date()} else {time2 = new Date(time2)};
		let timeDif = Math.abs((Number(time2) - time1) / 1000);
		if (Number(time2) > Number(time1)) {endStr = "ago"} else {endStr = "left"}
		
		if (timeDif < 60) {
			baseStr = `${(timeDif * 10).toFixed(1)} seconds`
		} else if (timeDif < 3600) {
			baseStr = `${Math.floor(timeDif / 60)} minutes, ${Math.round(timeDif % 60)} seconds`
		} else if (timeDif < 86400) {
			baseStr = `${Math.floor(timeDif / 3600)} hours, ${Math.floor((timeDif % 3600) / 60)} minutes`
		} else if (timeDif < 2592000) {
			baseStr = `${Math.floor(timeDif / 86400)} days, ${Math.floor((timeDif % 86400) / 3600)} hours`
		} else if (timeDif < 3.1536e+9) {
			let yrDif = time2.getYear() - time1.getYear();
			let moDif = time2.getMonth() - time1.getMonth();
			let dayDif = time2.getDate() - time1.getDate();
			if ((moDif == 0 && dayDif < 0) || moDif < 0) {yrDif--; moDif += 12;}
			if (dayDif < 0) {moDif--; dayDif += 30;}
			if (timeDif < 31536000) {baseStr = `${moDif} months, ${dayDif} days`} else {
				if (dayDif >= 20) {
					moDif++;
					if (moDif > 11) {moDif = 0; yrDif++;}
				}
				baseStr = `${yrDif} years, ${moDif} months`
			}
		} else {
			baseStr = `${Math.round((timeDif - 5256000) / 31536000)} years`
		}
		return `${baseStr} ${endStr}`;
	}
}