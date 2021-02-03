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
exports.QueueCommand = void 0;
const discord_js_1 = __importDefault(require("discord.js"));
const command_1 = __importDefault(require("../struct/command"));
class QueueCommand extends command_1.default {
    constructor(chef) {
        super(chef, {
            name: "queue",
            aliases: ["q"],
            group: "oper",
            memberName: "queue",
            description: "Zeigt die aktuelle Queue.",
            guildOnly: true,
        });
    }
    run(message) {
        const queue = this.chef.queues.get(message.guild.id);
        if (!queue || !queue.videos.size())
            return message.say("keine queue vorhanden");
        const embed = new discord_js_1.default.MessageEmbed().setTitle("Queue");
        let i = 1;
        queue.videos.forEach((element) => {
            embed.addField(`${i++}.`, element.title);
        });
        return message.say(embed);
    }
}
exports.QueueCommand = QueueCommand;
//# sourceMappingURL=queue.js.map