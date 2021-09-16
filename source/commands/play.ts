//
// Created on Wed Jan 26 2021
//
// Copyright (c) Valentin Walter 2021
//

import Discord from "discord.js"
import ytdl from "ytdl-core"
import Commando from "discord.js-commando"
import { Video } from "simple-youtube-api"
import * as Collections from "typescript-collections"
import Command from "../struct/command"
import Chef from "../struct/chef"
import Queue from "../struct/queue"
import Constants from "../struct/constants"

export class PlayCommand extends Command {
	constructor(chef: Chef) {
		super(chef, {
			name: "play",
			aliases: ["p"],
			group: "oper",
			memberName: "play",
			description:
				"Searches YouTube for your query and plays in the voice channel you're connected to.",
			guildOnly: true,
			args: [
				{
					key: "query",
					prompt: "ich brauch ein video",
					type: "string",
				},
			],
		})
	}

	async run(
		message: Commando.CommandoMessage,
		args: { query: string }
	): Promise<Commando.CommandoMessage> {
		try {
			const url = await this.queryToURL(args.query)
			const video = await this.chef.youtube.getVideo(url)

			if (!video || !video.duration) throw "konnte kein video finden"

			await this.queue(video, message.member)

			const duration = `${video.duration.minutes}m ${video.duration.seconds}s`
			const videoTitle = `🎸🎶 **${video.title}** \`(${duration})\``

			message.react("👍")
			return message.say(videoTitle)
		} catch (error) {
			console.warn(error)
			message.react("👎")
			const embed = new Discord.MessageEmbed()
				.setTitle(error)
				.setColor(Constants.colors.red)
			return message.say(embed)
		}
	}

	private async queue(video: Video, member: Discord.GuildMember | null) {
		if (!member) throw "du musst in einem server sein"
		const guildID = member.guild.id

		let queue = this.chef.queues.get(guildID)
		if (!queue) {
			console.log(`playing ${video.title}`)

			const connection = await this.establishConnection(member)
			const videos = new Collections.Queue<Video>()
			queue = new Queue(connection, videos)

			this.play(video, queue)
			this.chef.queues.set(guildID, queue)
		} else {
			console.log(`queuing ${video.title}`)
			queue.videos.enqueue(video)
		}

		queue.connection.dispatcher.on("disconnect", () =>
			this.chef.queues.delete(guildID)
		)
		queue.connection.dispatcher.on("error", console.warn)
	}

	private async play(video: Video, queue: Queue) {
		const stream = ytdl(video.url, {
			quality: "highestaudio",
			highWaterMark: 1 << 25,
			filter: "audioonly",
		})
		const dispatcher = queue.connection.play(stream)
		queue.nowplaying = video

		dispatcher.on("finish", () => {
			console.log("finished queue")
			queue.nowplaying = undefined
			if (queue?.loop) queue.videos.enqueue(video)
			const song = queue?.videos.dequeue()
			if (!song) return
			if (song) this.play(song, queue)
		})
	}

	private async establishConnection(
		member: Discord.GuildMember | null
	): Promise<Discord.VoiceConnection> {
		if (!member) throw "du musst in einem server sein"

		const channel = member.voice.channel
		if (!channel) throw "du musst in einem voice channel sein"
		if (!channel.joinable) throw `kann nicht ${channel.name} beitreten`

		return await channel.join()
	}

	private async queryToURL(query: string): Promise<string> {
		const videos = await this.chef.youtube.searchVideos(query, 1)
		if (!videos.length) {
			throw "keine Suchergebnisse gefunden"
		}
		return videos[0].url
	}
}
