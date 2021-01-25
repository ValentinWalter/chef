import { Message, StreamDispatcher, VoiceConnection } from "discord.js"
import ytdl from "ytdl-core"

import YouTube from "simple-youtube-api"
const youtube = new YouTube("AIzaSyDIJHTwVzdvPTA34FrPRKwECmieixrvQK4")

const queues: { [guild: string]: Queue } = {}
let dispatcher: StreamDispatcher

class Queue {
	links: string[]
	dispatcher?: StreamDispatcher

	constructor(links: string[] = [], dispatcher?: StreamDispatcher) {
		this.links = links
		this.dispatcher = dispatcher
	}
}

export function leave(message: Message) {
	if (message.member == null) return
	if (message.guild == null) return
	if (message.member.voice.channel == null) return

	message.member.voice.channel.leave()
	queues[message.guild.id] = new Queue()
	message.react("👍")
	console.log("left voice channel: user intent")
}

export async function play(link: string, message: Message) {
	// Queue link
	// if (!message.guild) return
	// if (!queues[message.guild.id]) queues[message.guild.id] = new Queue()
	// const queue = queues[message.guild.id]

	// // Check if joinable
	if (!message.member) return
	const voiceChannel = message.member.voice.channel
	if (!voiceChannel) {
		message.reply("du musst in einem voice channel sein.")
		console.log("user not in voice channel")
		return
	}

	// // Validate link
	if (link) {
		const searchString = link
		if (!searchString) {
			return message.channel.send("You need to specific a song to play.")
		}

		const handleVideo = async (url) => {
			try {
				// eslint-disable-next-line no-var
				var songInfo = await ytdl.getBasicInfo(url)
			} catch (error) {
				console.log(error)
				return message.channel.send(
					"There was an issue when fetching the song's metadata.",
				)
			}

			const title = songInfo.videoDetails.title.replace(/\(.+\)/g, "").trim()

			const song = {
				title: title,
				url: songInfo.videoDetails.video_url,
				duration: songInfo.videoDetails.lengthSeconds,
			}

			play(song)
		}

		const play = async (song) => {
			if (!song) {
				voiceChannel.leave()
				return
			}

			try {
				var connection = await voiceChannel.join() // eslint-disable-line no-var
				const stream = ytdl(song.url)
				dispatcher = connection.play(stream) // eslint-disable-line no-var

				message.react("👍")
				message.channel.send("dein wunsch sei mir befehl")
				const minutes = (song.duration / 60).toFixed(0)
				const seconds = song.duration % 60
				const duration = `${minutes}m ${seconds}s`
				message.channel.send(`🎸🎶 **${song.title}** \`(${duration})\``)
			} catch (error) {
				console.log(error)
				return message.channel.send(
					"There was an error while trying to play a song.",
				)
			}

			// try {
			//     // eslint-disable-next-line no-var
			//     var msg = await message.channel.send(`🎶 Started Playing: **${song.title}**`);
			//     await msg.react('⏸️');
			//     await msg.react('▶️');
			//     await msg.react('⏹️');
			//     await msg.react('⏩');
			//     await msg.react('🔁');
			// }
			// catch (error) {
			//     console.log(error);
			// }
			// const filter = (reaction, user) => user.id === message.author.id;
			// const collector = message.createReactionCollector(filter, { time: song.duration * 1000 });

			// collector.on('collect', (reaction, user) => {
			//     const member = message.guild!.member(user);

			//     switch (reaction.emoji.name) {
			//         case '⏸️':
			//             if (!playing) return;
			//             playing = false;
			//             return dispatcher.pause();
			//         case '▶️':
			//             if (playing) return;
			//             playing = true;
			//             return connection.dispatcher.resume();
			//         case '⏹️':
			//             queue.delete(guild.id);
			//             return voice.channel.leave();
			//         case '⏩':
			//             return connection.dispatcher.end();
			//         case '🔁':
			//             return loop = !loop;
			//         default:
			//             return null;
			//     }
			// });

			// collector.on('end', () => {
			//     msg.reactions.removeAll().catch(err => console.log(err));
			// });

			// dispatcher.on('finish', () => {
			//     if (loop) {
			//         const lastSong = songs.shift();
			//         songs.push(lastSong);
			//         message.delete().catch(error => console.log(error));
			//     }
			//     else {
			//         songs.shift();
			//         message.delete().catch(error => console.log(error));
			//     }
			//     play(serverQueue.songs[0]);
			// });

			dispatcher.on("error", (error) => console.warn(error))
			// connection.on('disconnect', () => queue.delete(guild.id));
		}

		if (
			searchString.match(
				/^https?:\/\/(www\.youtube\.com|youtube\.com)\/playlist(.*)$/,
			)
		) {
			// try {
			//     const playlist = await youtube.getPlaylist(searchString);
			//     const videos = await playlist.getVideos();
			//     message.channel.send(`✅ Added playlist **${playlist.title}** to the queue.`);
			//     for (const video of Object.values(videos)) {
			//         await handleVideo(video.id, true);
			//     }
			// }
			// catch (error) {
			//     console.log(error);
			//     return message.channel.send('There was an issue when fetching this playlist.');
			// }
		} else {
			try {
				// eslint-disable-next-line no-var
				var songInfo = await youtube.getVideo(searchString)
				await handleVideo(songInfo.id)
			} catch (error) {
				if (error && !error.message.startsWith("No video ID found in URL:")) {
					console.warn(error)
				}
				try {
					songInfo = await youtube.searchVideos(searchString, 1)
					if (!songInfo.length) {
						return message.channel.send("No search results found.")
					}
					await handleVideo(songInfo[0].id)
				} catch (err) {
					console.log(err)
					return message.channel.send(
						"There seems to have been an error while fetching the video.",
					)
				}
			}
		}
	}
}

// async function connect(connection: VoiceConnection, queue: Queue) {
// 	const link = queue.links.shift()
// 	if (!link) return
// 	const stream = await ytdl(link, { filter: "audioonly" })
// 	queue.dispatcher = connection.play(stream, { type: "opus" })
// 	console.log(`playing ${link}`)
// 	queue.dispatcher.on("end", () => {
// 		if (queue.links.length > 0) {
// 			console.log("advancing to next item")
// 			connect(connection, queue)
// 		} else {
// 			console.log("disconnect: queue ended")
// 			connection.disconnect()
// 		}
// 	})
// }
