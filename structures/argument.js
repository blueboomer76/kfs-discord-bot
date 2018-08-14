class Argument {
	constructor(props) {
		this.allowQuotes = props.allowQuotes || false;
		this.defaultValue = props.defaultValue || null;
		this.errorMessage = props.errorMessage || "Not enough arguments provided";
		this.num = props.num || 1;
		this.parseSeperately = props.parseSeperately || false;
		this.optional = props.optional || false;
		this.type = props.type;
		
		if (!props.type) throw new Error("Argument type not given");
	}
}

module.exports = Argument;