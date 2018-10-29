const Argument = require("./argument.js");
const Flag = require("./flag.js");

class Command {
	constructor(props) {
		this.name = props.name;
		this.description = props.description || "No description provided";
		this.aliases = props.aliases || [];
		this.allowDMs = props.allowDMs || false;
		this.args = [];
		this.cooldown = props.cooldown || {time: 15000, type: "user"};
		this.disabled = props.disabled || false;
		this.examples = props.examples || [];
		this.flags = [];
		this.hidden = props.hidden || false;
		this.perms = props.perms || {bot: [], user: [], role: null, level: 0};
		this.usage = props.usage || this.name;
		
		if (props.args) {
			for (const arg of props.args) {this.args.push(new Argument(arg))}
		}
		if (props.flags) {
			for (const flag of props.flags) {this.flags.push(new Flag(flag))}
		}
	}
	
	async run() {
		throw new Error(`The command ${this.name} does not have a run() method`);
	}
}

module.exports = Command;
