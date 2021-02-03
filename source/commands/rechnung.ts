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

export class RechnungCommand extends Command {
	constructor(chef: Chef) {
		super(chef, {
			name: "rechnung",
			aliases: ["check"],
			group: "restaurant",
			memberName: "rechnung",
			description: "tilge deine schulden",
		})
	}

	run(message: Commando.CommandoMessage): Promise<Commando.CommandoMessage> {
		const check = this.chef.restaurant.getCheck(message)
		return message.say(check)
	}
}
