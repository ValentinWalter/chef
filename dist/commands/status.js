"use strict";
/*
 * Created on Wed Jan 26 2021
 *
 * Copyright (c) 2021 Your Company
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCommand = void 0;
const discord_js_1 = __importDefault(require("discord.js"));
const discord_js_commando_1 = __importDefault(require("discord.js-commando"));
class StatusCommand extends discord_js_commando_1.default.Command {
    constructor(chef) {
        super(chef, {
            name: "status",
            aliases: ["st"],
            group: "werkzeugkasten",
            memberName: "status",
            description: "Shows various system and process related statistics.",
        });
    }
    run(message) {
        const memory = process.memoryUsage();
        const embed = new discord_js_1.default.MessageEmbed()
            .setTitle(`${process.title} ${process.pid}`)
            .addField("Platform", process.platform)
            // .addField("Resource Usage", process.resourceUsage().)
            .addField("Total Allocated", `${Math.round((memory.rss / 1024 / 1024) * 100) / 100} MB`, true)
            .addField("Heap Used", `${Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100} MB`, true)
            .addField("CPU Usage", process.cpuUsage().user);
        return message.say(embed);
    }
}
exports.StatusCommand = StatusCommand;
//# sourceMappingURL=status.js.map