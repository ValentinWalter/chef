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
exports.VolumeCommand = void 0;
const command_1 = __importDefault(require("../struct/command"));
class VolumeCommand extends command_1.default {
    constructor(chef) {
        super(chef, {
            name: "volume",
            aliases: ["vol", "lautstärke"],
            group: "oper",
            memberName: "volume",
            guildOnly: true,
            description: "stellt die laustärke ein (1-100)",
        });
    }
    run(message, ...args) {
        // eslint-disable-next-line @typescript-eslint/ban-types
        const number = Number(args[0]);
        const queue = this.chef.queues.get(message.guild.id);
        if (!queue)
            return message.say("keine queue vorhanden");
        if (number || args[0] === "0") {
            const volume = Math.round(number.clamp(0, 100));
            queue?.connection.dispatcher.setVolume(volume / 100);
        }
        return message.say(`🔊 ${(queue.connection.dispatcher.volume * 100).toFixed(0)}`);
    }
}
exports.VolumeCommand = VolumeCommand;
Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this.valueOf(), min), max);
};
//# sourceMappingURL=volume.js.map