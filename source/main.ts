import * as dotenv from "dotenv"
dotenv.config()

import Discord from "discord.js"
import Restaurant from "./Restaurant/restaurant"
import Casino from "./Casino/casino"
import Database from "./database"
import ProcessUtility from "./Utilities/process"
import * as Voice from "./Voice/voice"
import * as Stupidshit from "./Utilities/stupidshit"

export const chef = new Discord.Client()
export const restaurant = new Restaurant()
export const casino = new Casino()
export const prefix = "?"

chef.once("ready", () => {
	console.log("Ready!")
	chef.user?.setPresence({
		activity: { name: "mit schulzi" },
		status: "online",
	})
})

chef.on("message", async (message) => {
	// stupidshit
	if (
		message.author.id == "769275223747854376" &&
		message.attachments.size == 0
	) {
		// Leonard
		// return
	} else if (message.author.id == "338408417645428736") {
		// Bonez
		const attachment = await Stupidshit.cracker()
		message.channel.send(attachment)
		return
	}

	if (!message.content.startsWith(prefix)) {
		Database.addToBalance(Math.floor(Math.random() * 10), message.author.id)
		return
	}

	const args = message.content.substring(prefix.length).toLowerCase().split(" ")

	switch (args[0]) {
	case "ping":
		message.channel.send("pong")
		break
	case "status": {
		const processInfo = new ProcessUtility().embed()
		message.channel.send(processInfo)
		break
	}
	case "play":
		Voice.play(args[1], message)
		break
	case "leave":
		Voice.leave(message)
		break
	case "rechnung":
		restaurant.getCheck(message)
		break
	case "speisekarte": {
		const menu = await restaurant.menu()
		message.channel.send(menu)
		break
	}
	case "bestell": {
		// combine all arguments
		const order = args.slice(1, args.length).join(" ")
		const items = order.split(", ")
		if (order.toLowerCase() == "den thymian") {
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
			restaurant.order(thymian, message)
		} else {
			restaurant.order(items, message)
		}
		break
	}
	case "gulden":
		const balance = Database.getBalance(message.author.id)
		const embed = new Discord.MessageEmbed()
			.setTitle(`${balance.toFixed(2)}€`)
			.setColor(0x00ffff)
			.setDescription(`Des ${message.member?.displayName}s Gulden.`)
			// .setThumbnail(message.author.avatarURL())
		message.channel.send(embed)
		break
	case "coinflip":
		casino.coinflip(Math.round(Number(args[1])), message)
		break
	case "cf":
		casino.coinflip(Math.round(Number(args[1])), message)
		break
	case "homo": {
		const text = args.slice(1, args.length).join(" ")
		const attachment = await Stupidshit.createImageWithText(text)
		message.delete()
		message.channel.send(attachment)
		break
	}
	default:
		break
	}
})

chef.login(process.env.DISCORD_CHEF_CLIENT_ID).catch(console.error)
// chef.on("debug", console.log)
