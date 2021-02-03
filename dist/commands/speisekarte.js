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
exports.SpeisekarteCommand = void 0;
const command_1 = __importDefault(require("../struct/command"));
class SpeisekarteCommand extends command_1.default {
    constructor(chef) {
        super(chef, {
            name: "speisekarte",
            aliases: ["speisen", "menu"],
            group: "restaurant",
            memberName: "speisekarte",
            description: "",
        });
    }
    async run(message) {
        const menu = await this.chef.restaurant.menu();
        return message.say(menu);
    }
}
exports.SpeisekarteCommand = SpeisekarteCommand;
//# sourceMappingURL=speisekarte.js.map