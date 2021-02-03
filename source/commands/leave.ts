//
// Created on Wed Jan 27 2021
//
// Copyright (c) Valentin Walter 2021
//

import Commando from "discord.js-commando"
import Command from "../struct/command"
import Chef from "../struct/chef"

export class LeaveCommand extends Command {
	constructor(chef: Chef) {
		super(chef, {
			name: "leave",
			aliases: ["stop", "l"],
			group: "oper",
			memberName: "leave",
			guildOnly: true,
			description: "stoppt die musik",
		})
	}

	run(message: Commando.CommandoMessage): Promise<Commando.CommandoMessage> {
		const queue = this.chef.queues.get(message.guild.id)
		if (!queue?.connection) return message.say("chef ist nirgends zu finden")
		queue.connection.disconnect()
		this.chef.queues.delete(message.guild.id)
		message.react("👍")
		return message.say("chef hat sich verzogen")
	}
}
