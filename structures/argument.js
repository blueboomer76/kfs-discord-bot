class Argument {
	constructor(props) {
		if (!props.type) throw new Error("Argument type not given");
		if (props.testFunction) {
			if (!props.errorMsg) throw new Error("Missing required error message for missing argument with a test function");
			this.testFunction = props.testFunction;
		}

		this.name = props.name;
		this.description = props.description;
		this.type = props.type;

		this.fullDescription = props.fullDescription || this.description;
		this.errorMsg = props.errorMsg || null;
		this.parsedType = props.parsedType;
		this.parsedTypeParams = props.parsedTypeParams;
		this.required = props.required || false;

		if (props.choices) this.choices = props.choices;
		if (props.min) this.min = props.min;
		if (props.max) this.max = props.max;
		if (props.types) this.types = props.types;
	}
}

module.exports = Argument;
