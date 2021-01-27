//
// Created on Wed Jan 27 2021
//
// Copyright (c) Valentin Walter 2021
//

import Commando from "discord.js-commando"
import Command from "../struct/command"
import Chef from "../struct/chef"

export class ResumeCommand extends Command {
	constructor(chef: Chef) {
		super(chef, {
			name: "resume",
			aliases: [],
			group: "oper",
			memberName: "resume",
			guildOnly: true,
			description: "spielt wieder ab",
		})
	}

	run(message: Commando.CommandoMessage): Promise<Commando.CommandoMessage> {
		const queue = this.chef.queues.get(message.guild.id)
		if (!queue?.connection.dispatcher)
			return message.say("nichts zum laufen lassen du aff")
		queue.connection.dispatcher.resume()
		message.react("👍")
		return message.say("musik ist back")
	}
}
