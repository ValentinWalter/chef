//
// Created on Wed Feb 03 2021
//
// Copyright (c) Valentin Walter 2021
//

// import Commando from "discord.js-commando"
// import Command from "../struct/command"
// import Chef from "../struct/chef"

// export class SetPrefixCommand extends Command {
// 	constructor(chef: Chef) {
// 		super(chef, {
// 			name: "setprefixx",
// 			aliases: [],
// 			group: "werkzeugkasten",
// 			memberName: "setprefix",
// 			guildOnly: true,
// 			description: "ändert den prefix",
// 			args: [
// 				{
// 					key: "prefix",
// 					prompt: "zu was willst du den prefix ändern?",
// 					type: "string",
// 				},
// 			],
// 		})
// 	}

// 	run(
// 		message: Commando.CommandoMessage,
// 		args: { prefix: string }
// 	): Promise<Commando.CommandoMessage> {
// 		if (message.member?.hasPermission("ADMINISTRATOR")) {
// 			this.chef.commandPrefix = args.prefix
// 			return message.say(`prefix ist jetzt \`${args.prefix}\``)
// 		} else {
// 			return message.say("smh du musst administrator rechte haben")
// 		}
// 	}
// }
