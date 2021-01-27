//
// Created on Wed Jan 27 2021
//
// Copyright (c) Valentin Walter 2021
//

import Commando from "discord.js-commando"
import Command from "../struct/command"
import Chef from "../struct/chef"

export class VolumeCommand extends Command {
	constructor(chef: Chef) {
		super(chef, {
			name: "volume",
			aliases: ["vol", "lautstärke"],
			group: "oper",
			memberName: "volume",
			guildOnly: true,
			description: "stellt die laustärke ein (1-100)",
		})
	}

	run(
		message: Commando.CommandoMessage,
		...args: unknown[]
	): Promise<Commando.CommandoMessage> {
		// eslint-disable-next-line @typescript-eslint/ban-types
		const number: Number = Number(args[0])
		const queue = this.chef.queues.get(message.guild.id)
		if (!queue) return message.say("keine queue vorhanden")
		if (number || args[0] === "0") {
			const volume = Math.round(number.clamp(0, 100))
			queue?.connection.dispatcher.setVolume(volume / 100)
		}
		return message.say(`🔊 ${(queue.connection.dispatcher.volume * 100).toFixed(0)}`)
	}
}

Number.prototype.clamp = function (min: number, max: number): number {
	return Math.min(Math.max(this.valueOf(), min), max)
}
