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
exports.RechnungCommand = void 0;
const command_1 = __importDefault(require("../struct/command"));
class RechnungCommand extends command_1.default {
    constructor(chef) {
        super(chef, {
            name: "rechnung",
            aliases: ["check"],
            group: "restaurant",
            memberName: "rechnung",
            description: "tilge deine schulden",
        });
    }
    run(message) {
        const check = this.chef.restaurant.getCheck(message);
        return message.say(check);
    }
}
exports.RechnungCommand = RechnungCommand;
//# sourceMappingURL=rechnung.js.map