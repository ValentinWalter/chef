//
// Created on Wed Jan 27 2021
//
// Copyright (c) Valentin Walter 2021
//

import Commando from "discord.js-commando"
import Command from "../struct/command"
import Chef from "../struct/chef"

export class PauseCommand extends Command {
	constructor(chef: Chef) {
		super(chef, {
			name: "pause",
			aliases: [],
			group: "oper",
			memberName: "pause",
			guildOnly: true,
			description: "pausiert",
		})
	}

	run(message: Commando.CommandoMessage): Promise<Commando.CommandoMessage> {
		const queue = this.chef.queues.get(message.guild.id)
		if (!queue?.connection.dispatcher) return message.say("nichts zum pausieren")
		queue.connection.dispatcher.pause()
		message.react("👍")
		return message.say("pausiert")
	}
}
