"use strict";
//
// Created on Wed Feb 03 2021
//
// Copyright (c) Valentin Walter 2021
//
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinflipCommand = void 0;
const discord_js_1 = __importDefault(require("discord.js"));
const command_1 = __importDefault(require("../struct/command"));
const database_1 = __importDefault(require("../struct/database"));
class CoinflipCommand extends command_1.default {
    constructor(chef) {
        super(chef, {
            name: "coinflip",
            aliases: ["cf"],
            group: "casino",
            memberName: "coinflip",
            description: "50/50",
            args: [
                {
                    key: "bet",
                    prompt: "deine wette?",
                    type: "integer",
                },
            ],
        });
    }
    run(message, args) {
        if (Math.random() < 0.49) {
            database_1.default.addToBalance(args.bet, message.author.id);
            const embed = new discord_js_1.default.MessageEmbed()
                .setTitle(`Du hast ${args.bet} Gulden gewonnen!`)
                .setColor(0x00e500);
            return message.say(embed);
        }
        else {
            database_1.default.addToBalance(-args.bet, message.author.id);
            const embed = new discord_js_1.default.MessageEmbed()
                .setTitle(`Du hast ${args.bet} Gulden verloren.`)
                .setColor(0xff0000);
            return message.say(embed);
        }
    }
}
exports.CoinflipCommand = CoinflipCommand;
//# sourceMappingURL=coinflip.js.map