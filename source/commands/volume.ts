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
			description: "stellt die laustärke ein",
			args: [
				{
					key: "volume",
					prompt: "setz eine lautstärke",
					type: "integer",
				},
			],
		})
	}

	run(
		message: Commando.CommandoMessage,
		args: { volume: number }
	): Promise<Commando.CommandoMessage> {
		const queue = this.chef.queues.get(message.guild.id)
		if (!queue) return message.say("keine queue vorhanden")
		const volume = args.volume.clamp(0, 100)
		if ((volume || volume === 0) && Number.isInteger(volume))
			queue?.connection.dispatcher.setVolume(volume / 100)
		return message.say(`🔊 ${(queue?.connection.dispatcher.volume * 100).toFixed(0)}`)
	}
}
