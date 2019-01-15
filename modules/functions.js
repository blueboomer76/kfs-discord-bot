function capitalize(str, capAll) {
	str = str.toString();
	if (capAll) {
		return str.split(/[ -]/).map(str2 => str2.charAt(0).toUpperCase() + str2.slice(1).toLowerCase()).join(" ");
	} else {
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	}
}

module.exports = {
	capitalize: capitalize,
	getDuration: (time1, time2, simple) => {
		if (!time1) throw new Error("Time 1 is required");
		if (isNaN(time1)) throw new Error("Time 1 is not a valid timestamp");
		if (time2 && isNaN(time2)) throw new Error("Time 2 is not a valid timestamp");

		const date1 = new Date(time1);
		let date2;
		if (!time2) {date2 = new Date()} else {date2 = new Date(time2)}
		const ts1 = Number(date1), ts2 = Number(date2);

		const timeDif = Math.abs((ts2 - ts1) / 1000);
		let suffix = "ago";
		if (ts1 > ts2) suffix = "left";

		let baseStr1 = "", baseStr2 = "";
		if (timeDif < 60) {
			baseStr1 = `${timeDif.toFixed(simple ? 0 : 1)} seconds`;
		} else if (timeDif < 3.1536e+9) {
			if (timeDif < 3600) {
				baseStr1 = `${Math.floor(timeDif / 60)} minute`;
				baseStr2 = `${Math.round(timeDif % 60)} second`;
			} else if (timeDif < 86400) {
				baseStr1 = `${Math.floor(timeDif / 3600)} hour`;
				baseStr2 = `${Math.floor((timeDif % 3600) / 60)} minute`;
			} else if (timeDif < 2592000) {
				baseStr1 = `${Math.floor(timeDif / 86400)} day`;
				baseStr2 = `${Math.floor((timeDif % 86400) / 3600)} hour`;
			} else {
				let yrDif = date2.getFullYear() - date1.getFullYear(),
					moDif = date2.getMonth() - date1.getMonth(),
					dayDif = date2.getDate() - date1.getDate();
				if ((moDif == 0 && dayDif < 0) || moDif < 0) {yrDif--; moDif += 12}
				if (dayDif < 0) {moDif--; dayDif += 30}
				if (timeDif < 31536000) {
					baseStr1 = `${moDif} month`;
					baseStr2 = `${dayDif} day`;
				} else {
					if (dayDif >= 20) {
						moDif++;
						if (moDif > 11) {moDif = 0; yrDif++}
					}
					baseStr1 = `${yrDif} year`;
					baseStr2 = `${moDif} month`;
				}
			}
			if (!baseStr1.startsWith("1 ")) baseStr1 += "s";
			if (!baseStr2.startsWith("1 ")) baseStr2 += "s";
			if (!simple) {
				baseStr1 += ",";
				baseStr2 += " ";
			}
		} else {
			baseStr1 = `${Math.round((timeDif - 5256000) / 31536000)} years`;
		}
		
		if (simple) {
			return `${baseStr1} ${suffix}`;
		} else {
			return `${baseStr1} ${baseStr2}${suffix}`;
		}
	},
	parsePerm: perm => {
		return perm.split("_").map(p => capitalize(p.toLowerCase())).join(" ");
	}
};
