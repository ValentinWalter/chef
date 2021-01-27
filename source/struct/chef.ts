//
// Created on Wed Jan 26 2021
//
// Copyright (c) Valentin Walter 2021
//

import { Collection } from "discord.js"
import YouTube from "simple-youtube-api"
import Commando from "discord.js-commando"
import Queue from "./queue"

export default class Chef extends Commando.CommandoClient {
	readonly youtube: YouTube
	readonly queues: Collection<string, Queue>

	constructor(options?: Commando.CommandoClientOptions) {
		super(options)
		this.youtube = new YouTube(process.env.YOUTUBE_API_KEY)
		this.queues = new Collection()
	}
}
