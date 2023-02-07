const Argument = require("./argument.js");

class Command {
	constructor(props) {
		this.name = props.name;
		this.description = props.description;
		this.fullDescription = props.fullDescription || this.description;
		this.allowDMs = props.allowDMs || false;
		this.args = [];
		this.cooldown = Object.assign({time: 15000, type: "user", name: null}, props.cooldown);
		this.disabled = props.disabled || false;
		this.examples = props.examples || [];
		this.hidden = props.hidden || false;
		this.nsfw = props.nsfw || false;
		this.perms = Object.assign({bot: [], user: [], role: null, level: 0}, props.perms);
		this.usage = props.usage || this.name;

		if (props.args) {
			for (const arg of props.args) this.args.push(new Argument(arg));
		}
	}

	async run() {
		throw new Error(`The command ${this.name} does not have a run() method`);
	}
}

module.exports = Command;
