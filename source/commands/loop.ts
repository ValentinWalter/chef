//
// Created on Wed Jan 27 2021
//
// Copyright (c) Valentin Walter 2021
//

import Commando from "discord.js-commando"
import Command from "../struct/command"
import Chef from "../struct/chef"

export class LoopCommand extends Command {
	constructor(chef: Chef) {
		super(chef, {
			name: "loop",
			aliases: [],
			group: "oper",
			memberName: "loop",
			guildOnly: true,
			description: "loopt die queue",
		})
	}

	run(message: Commando.CommandoMessage): Promise<Commando.CommandoMessage> {
		const queue = this.chef.queues.get(message.guild.id)
		if (!queue) return message.say("keine queue vorhanden")
		queue.loop = !queue.loop
		message.react("👍")
		return message.say(queue.loop ? "🔁 loop an" : "loop aus")
	}
}
