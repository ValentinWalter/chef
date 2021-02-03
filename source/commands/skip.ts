//
// Created on Wed Jan 27 2021
//
// Copyright (c) Valentin Walter 2021
//

import Commando from "discord.js-commando"
import Command from "../struct/command"
import Chef from "../struct/chef"

export class SkipCommand extends Command {
	constructor(chef: Chef) {
		super(chef, {
			name: "skip",
			aliases: ["s"],
			group: "oper",
			memberName: "skip",
			description: "Skips current song.",
		})
	}

	run(message: Commando.CommandoMessage): Promise<Commando.CommandoMessage> {
		const queue = this.chef.queues.get(message.guild.id)
		if (!queue?.connection.dispatcher)
			return message.say("nichts zum skippen my dude")
		queue.connection.dispatcher.end()
		message.react("👍")
		return message.say("geskipped")
	}
}
