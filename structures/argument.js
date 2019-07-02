class Argument {
	constructor(props) {
		if (!props.type) throw new Error("Argument type not given");
		if (props.testFunction) {
			if (!props.errorMsg) throw new Error("Missing required error message for missing argument with type 'function'");
			this.testFunction = props.testFunction;
		}

		this.allowQuotes = props.allowQuotes || false;
		this.errorMsg = props.errorMsg || null;
		this.infiniteArgs = props.infiniteArgs || false;
		this.missingArgMsg = props.missingArgMsg || null;
		this.noTrim = props.noTrim || false;
		this.optional = props.optional || false;
		this.parseSeperately = props.parseSeperately || false;
		this.shiftable = props.shiftable || false;
		this.type = props.type;
		
		if (props.allowedValues) this.allowedValues = props.allowedValues;
		if (props.min) this.min = props.min;
		if (props.max) this.max = props.max;
		if (props.allowRaw) this.allowRaw = props.allowRaw;
	}
}

module.exports = Argument;