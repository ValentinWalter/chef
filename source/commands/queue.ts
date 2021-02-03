//
// Created on Wed Jan 27 2021
//
// Copyright (c) Valentin Walter 2021
//

import Discord from "discord.js"
import Commando from "discord.js-commando"
import Command from "../struct/command"
import Chef from "../struct/chef"

export class QueueCommand extends Command {
	constructor(chef: Chef) {
		super(chef, {
			name: "queue",
			aliases: ["q"],
			group: "oper",
			memberName: "queue",
			description: "Zeigt die aktuelle Queue.",
			guildOnly: true,
		})
	}

	run(message: Commando.CommandoMessage): Promise<Commando.CommandoMessage> {
		const queue = this.chef.queues.get(message.guild.id)
		if (!queue || !queue.videos.size()) return message.say("keine queue vorhanden")

		const embed = new Discord.MessageEmbed().setTitle("Queue")

		let i = 1
		queue.videos.forEach((element) => {
			embed.addField(`${i++}.`, element.title)
		})

		return message.say(embed)
	}
}
