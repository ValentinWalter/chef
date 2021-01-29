//
// Created on Thu Jan 28 2021
//
// Copyright (c) Valentin Walter 2021
//

import Commando from "discord.js-commando"
import Command from "../struct/command"
import Chef from "../struct/chef"

export class SlotsCommand extends Command {
	constructor(chef: Chef) {
		super(chef, {
			name: "slots",
			aliases: [],
			group: "casino",
			memberName: "slots",
			description: "SLOTS",
		})
	}

	run(message: Commando.CommandoMessage): Promise<Commando.CommandoMessage> {

		return message.say("chef")
	}
}
