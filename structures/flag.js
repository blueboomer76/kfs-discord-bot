class Flag {
	constructor(props) {
		this.name = props.name;
		this.allowArray = props.allowArray || false;
		if (props.arg) this.arg = new FlagArgument(props.arg);
	}
}

class FlagArgument {
	constructor(props) {
		this.num = props.num || 1;
		this.optional = props.optional || false;
		this.type = props.type;
	}
}

module.exports = Flag;
