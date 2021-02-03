"use strict";
//
// Created on Wed Jan 27 2021
//
// Copyright (c) Valentin Walter 2021
//
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NowPlayingCommand = void 0;
const command_1 = __importDefault(require("../struct/command"));
class NowPlayingCommand extends command_1.default {
    constructor(chef) {
        super(chef, {
            name: "nowplaying",
            aliases: ["now", "musik"],
            group: "oper",
            memberName: "nowplaying",
            guildOnly: true,
            description: "zeigt was grade spielt",
        });
    }
    run(message) {
        const queue = this.chef.queues.get(message.guild.id);
        if (!queue?.nowplaying)
            return message.say("nichts spielt grade");
        return message.say(queue.nowplaying.title);
    }
}
exports.NowPlayingCommand = NowPlayingCommand;
//# sourceMappingURL=nowplaying.js.map