//
// Created on Wed Jan 26 2021
//
// Copyright (c) Valentin Walter 2021
//

import Commando from "discord.js-commando"
import Chef from "./chef"

export default abstract class Command extends Commando.Command {
	readonly chef: Chef

	constructor(chef: Chef, info: Commando.CommandInfo) {
		super(chef, info)
		this.chef = chef
	}
}
