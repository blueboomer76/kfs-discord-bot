class Argument {
	constructor(props) {
		this.allowQuotes = props.allowQuotes || false;
		this.errorMsg = props.argErrorMsg || null;
		this.missingArgMsg = props.missingArgMsg || null;
		this.infiniteArgs = props.infiniteArgs || false;
		this.optional = props.optional || false;
		this.parseSeperately = props.parseSeperately || false;
		this.shiftable = props.shiftable || false;
		this.type = props.type;
		
		if (props.min) this.min = props.min;
		if (props.max) this.max = props.max;
		if (props.allowedValues) this.allowedValues = props.allowedValues;
		
		if (!props.type) throw new Error("Argument type not given");
	}
}

module.exports = Argument;