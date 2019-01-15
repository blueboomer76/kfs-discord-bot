class Argument {
	constructor(props) {
		this.allowQuotes = props.allowQuotes || false;
		this.errorMsg = props.errorMsg || null;
		this.missingArgMsg = props.missingArgMsg || null;
		this.noTrim = props.noTrim || false;
		this.infiniteArgs = props.infiniteArgs || false;
		this.optional = props.optional || false;
		this.parseSeperately = props.parseSeperately || false;
		this.shiftable = props.shiftable || false;
		this.type = props.type;
		
		if (props.allowedValues) this.allowedValues = props.allowedValues;
		if (props.min) this.min = props.min;
		if (props.max) this.max = props.max;
		if (props.testFunction) {
			this.testFunction = props.testFunction;
			if (!props.errorMsg) throw new Error("Missing required message for missing arg message with type test function");
		}
			
		if (!props.type) throw new Error("Argument type not given");
	}
}

module.exports = Argument;