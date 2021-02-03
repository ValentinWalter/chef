//
// Created on Wed Feb 03 2021
//
// Copyright (c) Valentin Walter 2021
//

// NOTICE
// This is code from the old version. I intended to
// reimplement this with SQLite but did not have the time.

import Commando from "discord.js-commando"
import Command from "../struct/command"
import Chef from "../struct/chef"

export class BestellCommand extends Command {
	constructor(chef: Chef) {
		super(chef, {
			name: "bestell",
			aliases: ["order", "get"],
			group: "restaurant",
			memberName: "bestell",
			description: "bestell essen aus chefs welt bekannter küche",
			args: [
				{
					key: "order",
					prompt: "was willst du bestellen",
					type: "string",
				},
			],
		})
	}

	async run(
		message: Commando.CommandoMessage,
		args: { order: string }
	): Promise<Commando.CommandoMessage> {
		if (
			args.order.toLowerCase() == "den thymian" ||
			args.order.toLowerCase() == "thymian"
		) {
			const thymian = [
				"Käsespätzle",
				"Lasagne",
				"Schnitzel",
				"Whiskey",
				"Crepes",
				"Eis",
				"Salatplatte",
				"Bratkartoffeln",
			]
			const order = await this.chef.restaurant.order(thymian, message.author.id)
			return message.say(order)
		} else {
			const items = args.order.split(" ")
			const order = await this.chef.restaurant.order(items, message.author.id)
			return message.say(order)
		}
	}
}
