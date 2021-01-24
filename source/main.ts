import * as dotenv from "dotenv"
dotenv.config()

import Discord from "discord.js"
import Restaurant from "./Restaurant/restaurant"
import Casino from "./Casino/casino"
import ProcessUtility from "./Utilities/process"
import * as Voice from "./Voice/voice"
import * as Stupidshit from "./Utilities/stupidshit"

export const chef = new Discord.Client()
export const restaurant = new Restaurant()
export const casino = new Casino()
export const prefix = "?"

export const users = new Map<string, User>()
class User {
	balance: number
	constructor(balance = 100) {
		this.balance = balance
	}
}

chef.once("ready", () => {
	console.log("Ready!")
	chef.user?.setPresence({ activity: { name: "mit schulzi" }, status: "online" })
})

chef.on("message", async message => {
	// stupidshit
	if (message.author.id == "769275223747854376" && message.attachments.size == 0) {
		// Leonard
		const attachment = await Stupidshit.createImageWithText(message.content)
		message.delete()
		message.channel.send(attachment)
		return
	}
	else if (message.author.id == "338408417645428736") {
		// Bonez
		const attachment = await Stupidshit.cracker()
		message.channel.send(attachment)
		return
	}

	if (!message.content.startsWith(prefix)) {
		// addToBalance(Math.floor(Math.random() * 10), message.author.id)
		return
	}

	const args = message.content
		.substring(prefix.length)
		.toLowerCase()
		.split(" ")

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
		const item = args.slice(1, args.length).join(" ")
		restaurant.order(item, message)
		break
	}
	case "gulden":
		// let balance = getBalance(message.author.id)
		// let embed = new Discord.MessageEmbed()
		//     .setTitle(`${balance.toFixed(2)}€`)
		//     .setColor(0x00FFFF)
		//     .setDescription(`Des ${message.member.nickname}s Geldsack.`)
		// // .setThumbnail(message.author.avatarURL())
		// message.channel.send(embed)
		break
	case "coinflip":
		casino.coinflip(Math.round(Number(args[1])), message)
		break
	case "cf":
		casino.coinflip(Math.round(Number(args[1])), message)
		break
	default:
		break
	}
})

chef.login(process.env.DISCORD_CHEF_CLIENT_ID)
	.catch(console.error)