const Argument = require("./argument.js"), Flag = require("./flag.js");

class Command {
	constructor(props) {
		this.name = props.name;
		this.description = props.description || "No description provided";
		this.aliases = props.aliases || [];
		this.allowDMs = props.allowDMs || false;
		this.args = [];
		this.cooldown = props.cooldown || {time: 15000, type: "user"};
		this.cooldown.name = (props.cooldown && props.cooldown.name) || null;
		this.disabled = props.disabled || false;
		this.examples = props.examples || [];
		this.flags = [];
		this.hidden = props.hidden || false;
		this.nsfw = props.nsfw || false;
		this.perms = props.perms || {bot: [], user: [], role: null, level: 0};
		this.subcommands = [];
		this.usage = props.usage || this.name;
		
		if (props.args) {
			for (const arg of props.args) this.args.push(new Argument(arg));
		}
		if (props.flags) {
			for (const flag of props.flags) this.flags.push(new Flag(flag));
		}
		if (props.subcommands) {
			for (const scmd of props.subcommands) this.subcommands.push(new SubCommand(scmd));
		}
	}
	
	async run() {
		throw new Error(`The command ${this.name} does not have a run() method`);
	}
}

class SubCommand {
	constructor(props) {
		this.name = props.name;
		this.args = [];

		if (props.args) {
			for (const arg of props.args) this.args.push(new Argument(arg));
		}
	}
}

module.exports = Command;
