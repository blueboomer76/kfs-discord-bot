const {MessageEmbed} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	{checkRemoteRequest} = require("../../modules/functions.js"),
	request = require("request");

const subcommands = [
	class BirdSubcommand extends Command {
		constructor() {
			super({
				name: "bird",
				description: "Get a random birb!",
				cooldown: {
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}

		async run(ctx) {
			await ctx.interaction.deferReply();

			request.get("http://random.birb.pw/tweet.json", (err, res) => {
				const requestRes = checkRemoteRequest("random.birb.pw", err, res);
				if (requestRes != true) return ctx.respond(requestRes);
				ctx.respond(new MessageEmbed()
					.setTitle("🐦 Here's your random birb!")
					.setColor(Math.floor(Math.random() * 16777216))
					.setFooter({text: "From random.birb.pw"})
					.setImage(`https://random.birb.pw/img/${JSON.parse(res.body).file}`)
				);
			});
		}
	},
	class CatSubcommand extends Command {
		constructor() {
			super({
				name: "cat",
				description: "Get a random cat!",
				cooldown: {
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}

		async run(ctx) {
			await ctx.interaction.deferReply();

			request.get("http://aws.random.cat/meow", (err, res) => {
				const requestRes = checkRemoteRequest("random.cat", err, res);
				if (requestRes != true) return ctx.respond(requestRes);
				ctx.respond(new MessageEmbed()
					.setTitle("🐱 Here's your random cat!")
					.setColor(Math.floor(Math.random() * 16777216))
					.setFooter({text: "From random.cat"})
					.setImage(JSON.parse(res.body).file)
				);
			});
		}
	},
	class DogSubcommand extends Command {
		constructor() {
			super({
				name: "dog",
				description: "Get a random dog!",
				cooldown: {
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}

		async run(ctx) {
			await ctx.interaction.deferReply();

			request.get("http://random.dog/woof.json", (err, res) => {
				const requestRes = checkRemoteRequest("random.dog", err, res);
				if (requestRes != true) return ctx.respond(requestRes);
				ctx.respond(new MessageEmbed()
					.setTitle("🐶 Here's your random dog!")
					.setColor(Math.floor(Math.random() * 16777216))
					.setFooter({text: "From random.dog"})
					.setImage(JSON.parse(res.body).url)
				);
			});
		}
	},
	class FoxSubcommand extends Command {
		constructor() {
			super({
				name: "fox",
				description: "Get a random fox!",
				cooldown: {
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}

		async run(ctx) {
			await ctx.interaction.deferReply();

			request.get("https://randomfox.ca/floof", (err, res) => {
				const requestRes = checkRemoteRequest("randomfox.ca", err, res);
				if (requestRes != true) return ctx.respond(requestRes);
				ctx.respond(new MessageEmbed()
					.setTitle("🦊 Here's your random fox!")
					.setColor(Math.floor(Math.random() * 16777216))
					.setFooter({text: "From randomfox.ca"})
					.setImage(JSON.parse(res.body).image)
				);
			});
		}
	},
	class CatFactsSubcommand extends Command {
		constructor() {
			super({
				name: "catfacts",
				description: "Get some cat facts!",
				cooldown: {
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}

		async run(ctx) {
			await ctx.interaction.deferReply();

			request.get({
				url: "https://catfact.ninja/facts",
				qs: {limit: 3},
				json: true
			}, (err, res) => {
				const requestRes = checkRemoteRequest("Cat Facts API", err, res);
				if (requestRes != true) return ctx.respond(requestRes);
				ctx.respond(new MessageEmbed()
					.setTitle("🐱 Cat Facts")
					.setDescription(res.body.data.map(entry => entry.fact).join("\n\n"))
					.setColor(Math.floor(Math.random() * 16777216))
				);
			});
		}
	},
	class DogFactsSubcommand extends Command {
		constructor() {
			super({
				name: "dogfacts",
				description: "Get some dog facts!",
				cooldown: {
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}

		async run(ctx) {
			await ctx.interaction.deferReply();

			request.get({
				url: "http://dog-api.kinduff.com/api/facts",
				qs: {number: 3},
				json: true
			}, (err, res) => {
				const requestRes = checkRemoteRequest("Dog Facts API", err, res);
				if (requestRes != true) return ctx.respond(requestRes);
				ctx.respond(new MessageEmbed()
					.setTitle("🐶 Dog Facts")
					.setDescription(res.body.facts.join("\n\n"))
					.setColor(Math.floor(Math.random() * 16777216))
				);
			});
		}
	}
];

class AnimalsCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "animals",
			description: "Animal commands",
			subcommands: subcommands
		});
	}
}

module.exports = AnimalsCommandGroup;
