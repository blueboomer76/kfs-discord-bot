module.exports = {
	capitalize: str => {
		str = str.toString();
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	},
	getDuration: (time1, time2) => {
		if (time1 == undefined) throw new Error("Time 1 is required");
		if (isNaN(time1)) throw new Error("Time 1 is not a valid timestamp");
		if (time2 != undefined && isNaN(time2)) throw new Error("Time 2 is not a valid timestamp");

		let baseStr, endStr;
		let date1 = new Date(time1), date2;
		if (!time2) {date2 = new Date()} else {date2 = new Date(time2)}
		let ts1 = Number(date1), ts2 = Number(date2);

		let timeDif = Math.abs((ts2 - ts1) / 1000);
		if (ts2 >= ts1) {endStr = "ago"} else {endStr = "left"}

		if (timeDif < 60) {
			baseStr = `${timeDif.toFixed(1)} seconds`
		} else if (timeDif < 3600) {
			baseStr = `${Math.floor(timeDif / 60)} minutes, ${Math.floor(timeDif % 60)} seconds`
		} else if (timeDif < 86400) {
			baseStr = `${Math.floor(timeDif / 3600)} hours, ${Math.floor((timeDif % 3600) / 60)} minutes`
		} else if (timeDif < 2678400) {
			baseStr = `${Math.floor(timeDif / 86400)} days, ${Math.floor((timeDif % 86400) / 3600)} hours`
		} else if (timeDif < 3.1536e+9) {
			let yrDif = date2.getFullYear() - date1.getFullYear();
			let moDif = date2.getMonth() - date1.getMonth();
			let dayDif = date2.getDate() - date1.getDate();
			if ((moDif == 0 && dayDif < 0) || moDif < 0) {yrDif--; moDif += 12;}
			if (dayDif < 0) {moDif--; dayDif += 30;}
			if (yrDif == 0) {
				baseStr = `${moDif} months, ${dayDif} days`
			} else {
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
