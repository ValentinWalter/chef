//
// Created on Wed Feb 03 2021
//
// Copyright (c) Valentin Walter 2021
//

import Discord from "discord.js"
import Commando from "discord.js-commando"
import Command from "../struct/command"
import Chef from "../struct/chef"
import Database from "../struct/database"

export class CoinflipCommand extends Command {
	constructor(chef: Chef) {
		super(chef, {
			name: "coinflip",
			aliases: ["cf"],
			group: "casino",
			memberName: "coinflip",
			description: "50/50",
			args: [
				{
					key: "bet",
					prompt: "deine wette?",
					type: "integer",
				},
			],
		})
	}

	run(
		message: Commando.CommandoMessage,
		args: { bet: number }
	): Promise<Commando.CommandoMessage> {
		if (Math.random() < 0.49) {
			Database.addToBalance(args.bet, message.author.id)
			const embed = new Discord.MessageEmbed()
				.setTitle(`Du hast ${args.bet} Gulden gewonnen!`)
				.setColor(0x00e500)
			return message.say(embed)
		} else {
			Database.addToBalance(-args.bet, message.author.id)
			const embed = new Discord.MessageEmbed()
				.setTitle(`Du hast ${args.bet} Gulden verloren.`)
				.setColor(0xff0000)
			return message.say(embed)
		}
	}
}
