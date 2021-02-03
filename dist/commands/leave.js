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
exports.LeaveCommand = void 0;
const command_1 = __importDefault(require("../struct/command"));
class LeaveCommand extends command_1.default {
    constructor(chef) {
        super(chef, {
            name: "leave",
            aliases: ["stop", "l"],
            group: "oper",
            memberName: "leave",
            guildOnly: true,
            description: "stoppt die musik",
        });
    }
    run(message) {
        const queue = this.chef.queues.get(message.guild.id);
        if (!queue?.connection)
            return message.say("chef ist nirgends zu finden");
        queue.connection.disconnect();
        this.chef.queues.delete(message.guild.id);
        message.react("👍");
        return message.say("chef hat sich verzogen");
    }
}
exports.LeaveCommand = LeaveCommand;
//# sourceMappingURL=leave.js.map