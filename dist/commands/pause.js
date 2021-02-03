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
exports.PauseCommand = void 0;
const command_1 = __importDefault(require("../struct/command"));
class PauseCommand extends command_1.default {
    constructor(chef) {
        super(chef, {
            name: "pause",
            aliases: [],
            group: "oper",
            memberName: "pause",
            guildOnly: true,
            description: "pausiert",
        });
    }
    run(message) {
        const queue = this.chef.queues.get(message.guild.id);
        if (!queue?.connection.dispatcher)
            return message.say("nichts zum pausieren du aff");
        queue.connection.dispatcher.pause();
        message.react("👍");
        return message.say("pausiert");
    }
}
exports.PauseCommand = PauseCommand;
//# sourceMappingURL=pause.js.map