class Flag {
	constructor(props) {
		this.name = props.name;
		this.desc = props.desc || "";
		this.allowArray = props.allowArray || false;
		if (props.arg) this.arg = new FlagArgument(props.arg);
	}
}

class FlagArgument {
	constructor(props) {
		this.num = props.num || 1;
		this.optional = props.optional || false;
		this.type = props.type;
		
		if (props.min) this.min = props.min;
		if (props.max) this.max = props.max;
		if (props.allowedValues) this.allowedValues = props.allowedValues;
	}
}

module.exports = Flag;
