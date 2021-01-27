"use strict";
//
// Created on Wed Jan 26 2021
//
// Copyright (c) Valentin Walter 2021
//
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_commando_1 = __importDefault(require("discord.js-commando"));
class Command extends discord_js_commando_1.default.Command {
    constructor(chef, info) {
        super(chef, info);
        this.chef = chef;
    }
}
exports.default = Command;
//# sourceMappingURL=command.js.map