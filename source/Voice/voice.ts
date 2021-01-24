import { Message, StreamDispatcher, VoiceConnection } from "discord.js"
import ytdl from "ytdl-core"

const queues: { [guild: string]: Queue } = {}

class Queue {
	links: string[]
	dispatcher?: StreamDispatcher

	constructor(links: [string], dispatcher?: StreamDispatcher) {
		this.links = links
		this.dispatcher = dispatcher
	}
}

export function leave(message: Message) {
	if (message.member == null) return
	if (message.member.voice.channel == null) return
	message.member.voice.channel.leave()
	message.react("👍")
	console.log("left voice channel: user intent")
}

export function play(link: string, message: Message) {
	// Queue link
	if (!message.guild) return
	const guildID = message.guild.id
	if (!queues[guildID]) {
		queues[guildID] = {
			links: [],
		}
	}

	const queue = queues[guildID]

	// Validate link
	if (link) {
		const validURL = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
		if (link.match(validURL)) {
			queue.links.push(link)
		}
		else {
			message.reply("das funktioniert nur mit einem direkten Link.")
			message.react("👎")
			console.log("link invalid")
			return
		}
	}
	else {
		message.reply("ich brauch einen link du aff")
		console.log("no link supplied")
		return
	}

	// Check if joinable
	if (!message.member) return
	const voiceChannel = message.member.voice.channel
	if (!voiceChannel) {
		message.reply("du musst in einem voice channel sein.")
		console.log("user not in voice channel")
		return
	}

	// if (voiceChannel.full) {
	//     message.reply(`${voiceChannel.name} ist voll.`)
	//     console.log("voice channel full")
	//     return
	// }

	if (!voiceChannel.joinable) {
		message.reply(`${voiceChannel.name} ist nicht joinable.`)
		console.log("voice channel not joinable")
		return
	}

	// Join voice channel if not already in one
	if (!message.guild.voice) {
		voiceChannel.join()
			.then(connection => {
				connect(connection, queue)
				message.react("👍")
				console.log("join voice channel: user intent")
			})
			.catch(error => {
				message.reply(`\`${error.message}\``)
				message.react("👎")
				voiceChannel.leave()
				console.log("left voice channel: internal error")
			})
	}
}

function connect(connection: VoiceConnection, queue: Queue) {
	const link = queue.links.shift()
	if (!link) return
	const stream = ytdl(link, { filter: "audioonly" })
	queue.dispatcher = connection.play(stream)
	console.log(`playing ${link}`)
	queue.dispatcher.on("end", () => {
		if (queue.links.length > 0) {
			console.log("advancing to next item")
			connect(connection, queue)
		}
		else {
			console.log("disconnect: queue ended")
			connection.disconnect()
		}
	})
}