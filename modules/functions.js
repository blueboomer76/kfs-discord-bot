const capitalize = (str, capAll) => {
	str = str.toString();
	if (capAll) {
		return str.split(" ").map(str2 => str2.charAt(0).toUpperCase() + str2.slice(1)).join(" ")
	} else {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}

module.exports = {
	capitalize: capitalize,
	getDuration: (time1, time2, simple) => {
		if (!time1) throw new Error("Time 1 is required")
		if (isNaN(time1)) throw new Error("Time 1 is not a valid timestamp");
		if (time2 && isNaN(time2)) throw new Error("Time 2 is not a valid timestamp");
		
		time1 = new Date(time1);
		if (!time2) {time2 = new Date()} else {time2 = new Date(time2)};
		
		let baseStr1 = "", baseStr2 = "", suffix = "ago", timeDif = Math.abs((time2 - time1) / 1000);
		if (time1 > time2) suffix = "left";
		
		if (timeDif < 60) {
			baseStr1 = `${timeDif.toFixed(1)} seconds`
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
				let yrDif = time2.getYear() - time1.getYear(),
					moDif = time2.getMonth() - time1.getMonth(),
					dayDif = time2.getDate() - time1.getDate();
				if ((moDif == 0 && dayDif < 0) || moDif < 0) {yrDif--; moDif += 12;}
				if (dayDif < 0) {moDif--; dayDif += 30;}
				if (timeDif < 31536000) {
					baseStr1 = `${moDif} month`;
					baseStr2 = `${dayDif} day`;
				} else {
					if (dayDif >= 20) {
						moDif++;
						if (moDif > 11) {moDif = 0; yrDif++;}
					}
					baseStr1 = `${yrDif} year`;
					baseStr2 = `${moDif} month`;
				}
			}
			if (!baseStr1.startsWith("1 ")) baseStr1 += "s";
			if (!baseStr2.startsWith("1 ")) baseStr2 += "s";
		} else {
			baseStr1 = `${Math.round((timeDif - 5256000) / 31536000)} years`
		}
		
		if (simple) {
			return `${baseStr1} ${suffix}`;
		} else {
			return `${baseStr1}, ${baseStr2} ${suffix}`;
		}
	},
	parsePerm: perm => {
		return perm.split("_").map(p => capitalize(p.toLowerCase())).join(" ");
	}
}