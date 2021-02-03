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

export class SpeisekarteCommand extends Command {
	constructor(chef: Chef) {
		super(chef, {
			name: "speisekarte",
			aliases: ["speisen", "menu"],
			group: "restaurant",
			memberName: "speisekarte",
			description: "",
		})
	}

	async run(message: Commando.CommandoMessage): Promise<Commando.CommandoMessage> {
		const menu = await this.chef.restaurant.menu()
		return message.say(menu)
	}
}
