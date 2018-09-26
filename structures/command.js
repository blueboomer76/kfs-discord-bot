const Argument = require("./argument.js");
const Flag = require("./flag.js");

class Command {
	constructor(props) {
		this.name = props.name;
		this.description = props.description || "No description provided";
		this.aliases = props.aliases || [];
		this.allowDMs = props.allowDMs || false;
		this.args = [];
		this.cooldown = props.cooldown || {time: 15000, type: "user"}
		this.flags = [];
		this.hidden = props.hidden || false;
		this.perms = props.perms || {bot: [], user: [], level: 0};
		this.startTyping = props.startTyping || false;
		this.usage = props.usage || this.name;
		
		if (props.args) {
			for (const arg of props.args) {
				let commandArg = new Argument(arg);
				this.args.push(commandArg);
			}
		}
		if (props.flags) {
			for (const flag of props.flags) {
				let commandFlag = new Flag(flag);
				this.flags.push(commandFlag);
			}
		}
	}
	
	async run() {
		throw "The command " + this.name + " does not have a run() method!"
	}
}

module.exports = Command;