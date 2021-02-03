//
// Created on Wed Jan 27 2021
//
// Copyright (c) Valentin Walter 2021
//

import Commando from "discord.js-commando"
import Command from "../struct/command"
import Chef from "../struct/chef"

export class NowPlayingCommand extends Command {
	constructor(chef: Chef) {
		super(chef, {
			name: "nowplaying",
			aliases: ["now", "musik"],
			group: "oper",
			memberName: "nowplaying",
			guildOnly: true,
			description: "zeigt was grade spielt",
		})
	}

	run(message: Commando.CommandoMessage): Promise<Commando.CommandoMessage> {
		const queue = this.chef.queues.get(message.guild.id)
		if (!queue?.nowplaying) return message.say("nichts spielt grade")
		return message.say(queue.nowplaying.title)
	}
}
