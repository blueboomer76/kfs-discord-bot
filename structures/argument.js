class Argument {
	constructor(props) {
		this.allowQuotes = props.allowQuotes || false;
		this.defaultValue = props.defaultValue || null;
		this.errorMsg = props.errorMsg || "Not enough arguments provided";
		this.num = props.num || 1;
		this.parseSeperately = props.parseSeperately || false;
		this.optional = props.optional || false;
		this.type = props.type;

		if (props.min) this.min = props.min;
		if (props.max) this.max = props.max;
		if (props.allowedValues) this.allowedValues = props.allowedValues;
		
		if (!props.type) throw new Error("Argument type not given");
	}
}

module.exports = Argument;
