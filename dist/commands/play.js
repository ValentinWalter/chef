"use strict";
//
// Created on Wed Jan 26 2021
//
// Copyright (c) Valentin Walter 2021
//
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayCommand = void 0;
const discord_js_1 = __importDefault(require("discord.js"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const Collections = __importStar(require("typescript-collections"));
const command_1 = __importDefault(require("../struct/command"));
const queue_1 = __importDefault(require("../struct/queue"));
const constants_1 = __importDefault(require("../struct/constants"));
class PlayCommand extends command_1.default {
    constructor(chef) {
        super(chef, {
            name: "play",
            aliases: ["p"],
            group: "oper",
            memberName: "play",
            description: "Searches YouTube for your query and plays in the voice channel you're connected to.",
            guildOnly: true,
            args: [
                {
                    key: "query",
                    prompt: "ich brauch ein video du aff",
                    type: "string",
                },
            ],
        });
    }
    async run(message, args) {
        try {
            const url = await this.queryToURL(args.query);
            const video = await this.chef.youtube.getVideo(url);
            if (!video || !video.duration)
                throw "konnte kein video finden";
            await this.queue(video, message.member);
            const duration = `${video.duration.minutes}m ${video.duration.seconds}s`;
            const videoTitle = `🎸🎶 **${video.title}** \`(${duration})\``;
            message.react("👍");
            return message.say(videoTitle);
        }
        catch (error) {
            console.warn(error);
            message.react("👎");
            const embed = new discord_js_1.default.MessageEmbed()
                .setTitle(error)
                .setColor(constants_1.default.colors.red);
            return message.say(embed);
        }
    }
    async queue(video, member) {
        if (!member)
            throw "du musst in einem server sein";
        const guildID = member.guild.id;
        let queue = this.chef.queues.get(guildID);
        if (!queue) {
            console.log(`playing ${video.title}`);
            const connection = await this.establishConnection(member);
            const videos = new Collections.Queue();
            queue = new queue_1.default(connection, videos);
            this.play(video, queue);
            this.chef.queues.set(guildID, queue);
        }
        else {
            console.log(`queuing ${video.title}`);
            queue.videos.enqueue(video);
        }
        queue.connection.dispatcher.on("disconnect", () => this.chef.queues.delete(guildID));
        queue.connection.dispatcher.on("error", console.warn);
    }
    async play(video, queue) {
        const stream = ytdl_core_1.default(video.url, {
            quality: "highestaudio",
            highWaterMark: 1 << 25,
            filter: "audioonly",
        });
        const dispatcher = queue.connection.play(stream);
        queue.nowplaying = video;
        dispatcher.on("finish", () => {
            console.log("finished queue");
            queue.nowplaying = undefined;
            if (queue?.loop)
                queue.videos.enqueue(video);
            const song = queue?.videos.dequeue();
            if (!song)
                return;
            if (song)
                this.play(song, queue);
        });
    }
    async establishConnection(member) {
        if (!member)
            throw "du musst in einem server sein";
        const channel = member.voice.channel;
        if (!channel)
            throw "du musst in einem voice channel sein";
        if (!channel.joinable)
            throw `kann nicht ${channel.name} beitreten`;
        return await channel.join();
    }
    async queryToURL(query) {
        const videos = await this.chef.youtube.searchVideos(query, 1);
        if (!videos.length) {
            throw "keine Suchergebnisse gefunden";
        }
        return videos[0].url;
    }
}
exports.PlayCommand = PlayCommand;
//# sourceMappingURL=play.js.map