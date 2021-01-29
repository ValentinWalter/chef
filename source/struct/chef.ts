//
// Created on Wed Jan 26 2021
//
// Copyright (c) Valentin Walter 2021
//

import Discord, { Collection } from "discord.js"
import YouTube from "simple-youtube-api"
import * as Blackjack from "engine-blackjack-ts"
import Commando from "discord.js-commando"
import Queue from "./queue"
import Constants from "../struct/constants"

export default class Chef extends Commando.CommandoClient {
	readonly youtube: YouTube
	readonly queues: Collection<string, Queue>
	readonly sessions: Collection<string, GameSession>

	constructor(options?: Commando.CommandoClientOptions) {
		super(options)
		this.youtube = new YouTube(process.env.YOUTUBE_API_KEY)
		this.queues = new Collection()
		this.sessions = new Collection<string, GameSession>()
	}

	public errorMessage(
		error: string,
		message: Commando.CommandoMessage
	): Promise<Commando.CommandoMessage> {
		const embed = new Discord.MessageEmbed()
			.setAuthor(
				message.member?.displayName,
				message.author.displayAvatarURL()
			)
			.setTitle(error)
			.setColor(Constants.colors.red)
		return message.say(embed)
	}
}

export class GameSession {
	game: Blackjack.Game
	member?: Discord.GuildMember
	message?: Discord.Message

	constructor(
		game: Blackjack.Game,
		member?: Discord.GuildMember,
		message?: Discord.Message
	) {
		this.game = game
		this.member = member
		this.message = message
	}
}
