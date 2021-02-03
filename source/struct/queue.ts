//
// Created on Wed Jan 27 2021
//
// Copyright (c) Valentin Walter 2021
//

import Discord from "discord.js"
import * as Collections from "typescript-collections"
import { Video } from "simple-youtube-api"

export default class Queue {
	connection: Discord.VoiceConnection
	videos: Collections.Queue<Video>
	loop: boolean
	nowplaying?: Video

	constructor(
		connection: Discord.VoiceConnection,
		videos: Collections.Queue<Video>,
		loop = false
	) {
		this.connection = connection
		this.videos = videos
		this.loop = loop
	}
}
