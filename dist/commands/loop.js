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
exports.LoopCommand = void 0;
const command_1 = __importDefault(require("../struct/command"));
class LoopCommand extends command_1.default {
    constructor(chef) {
        super(chef, {
            name: "loop",
            aliases: [],
            group: "oper",
            memberName: "loop",
            guildOnly: true,
            description: "loopt die queue",
        });
    }
    run(message) {
        const queue = this.chef.queues.get(message.guild.id);
        if (!queue)
            return message.say("keine queue vorhanden");
        queue.loop = !queue.loop;
        message.react("👍");
        return message.say(queue.loop ? "🔁 loop an" : "loop aus");
    }
}
exports.LoopCommand = LoopCommand;
//# sourceMappingURL=loop.js.map