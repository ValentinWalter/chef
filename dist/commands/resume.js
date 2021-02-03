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
exports.ResumeCommand = void 0;
const command_1 = __importDefault(require("../struct/command"));
class ResumeCommand extends command_1.default {
    constructor(chef) {
        super(chef, {
            name: "resume",
            aliases: [],
            group: "oper",
            memberName: "resume",
            guildOnly: true,
            description: "spielt wieder ab",
        });
    }
    run(message) {
        const queue = this.chef.queues.get(message.guild.id);
        if (!queue?.connection.dispatcher)
            return message.say("nichts zum laufen lassen du aff");
        queue.connection.dispatcher.resume();
        message.react("👍");
        return message.say("musik ist back");
    }
}
exports.ResumeCommand = ResumeCommand;
//# sourceMappingURL=resume.js.map