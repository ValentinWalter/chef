//
// Created on Wed Jan 26 2021
//
// Copyright (c) Valentin Walter 2021
//

import Dotenv from "dotenv"
import Path from "path"
import Chef from "./struct/chef"

Dotenv.config()

const chef = new Chef({
	commandPrefix: ".",
	owner: process.env.DISCORD_CHEF_OWNER_ID,
})

chef.registry
	.registerDefaultTypes()
	.registerGroups([
		["casino", "Verspiel all dein Geld."],
		["restaurant", "Erlebe Chefs berüchtigte Küche."],
		["oper", "Schlaf ein zu sanften Klängen."],
		["werkzeugkasten", "Allerlei nützliches."],
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(Path.join(__dirname, "commands"))

chef.once("ready", () => {
	console.log(`Logged in as ${chef.user?.tag}!`)
	chef.user?.setActivity("mit Schulzi")
})

chef.on("error", console.error)

chef.login(process.env.DISCORD_CHEF_CLIENT_ID)