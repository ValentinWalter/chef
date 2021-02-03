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
exports.SkipCommand = void 0;
const command_1 = __importDefault(require("../struct/command"));
class SkipCommand extends command_1.default {
    constructor(chef) {
        super(chef, {
            name: "skip",
            aliases: ["s"],
            group: "oper",
            memberName: "skip",
            description: "Skips current song.",
        });
    }
    run(message) {
        const queue = this.chef.queues.get(message.guild.id);
        if (!queue?.connection.dispatcher)
            return message.say("nichts zum skippen my dude");
        queue.connection.dispatcher.end();
        message.react("👍");
        return message.say("geskipped");
    }
}
exports.SkipCommand = SkipCommand;
//# sourceMappingURL=skip.js.map