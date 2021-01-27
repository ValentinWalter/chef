/*
 * Created on Wed Jan 26 2021
 *
 * Copyright (c) 2021 Your Company
 */

import Discord from "discord.js"
import Commando from "discord.js-commando"

export class StatusCommand extends Commando.Command {
	constructor(chef: Commando.CommandoClient) {
		super(chef, {
			name: "status",
			aliases: ["st"],
			group: "werkzeugkasten",
			memberName: "status",
			description: "Shows various system and process related statistics.",
		})
	}

	run(message: Commando.CommandoMessage): Promise<Commando.CommandoMessage> {
		const memory = process.memoryUsage()

		const embed = new Discord.MessageEmbed()
			.setTitle(`${process.title} ${process.pid}`)
			.addField("Platform", process.platform)
			// .addField("Resource Usage", process.resourceUsage().)
			.addField(
				"Total Allocated",
				`${Math.round((memory.rss / 1024 / 1024) * 100) / 100} MB`,
				true
			)
			.addField(
				"Heap Used",
				`${Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100} MB`,
				true
			)
			.addField("CPU Usage", process.cpuUsage().user)

		return message.say(embed)
	}
}
