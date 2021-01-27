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
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const chef_1 = __importDefault(require("./struct/chef"));
dotenv_1.default.config();
const chef = new chef_1.default({
    commandPrefix: ".",
    owner: process.env.DISCORD_CHEF_OWNER_ID,
});
chef.registry
    .registerDefaultTypes()
    .registerGroups([
    ["casino", "Verspiel all dein Geld."],
    ["restaurant", "Erlebe Chefs berüchtigte Küche."],
    ["oper", "Schlaf ein zu sanften Klängen."],
    ["werkzeugkasten", "Allerlei nützliches."],
])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path_1.default.join(__dirname, "commands"));
chef.once("ready", () => {
    console.log(`Logged in as ${chef.user?.tag}!`);
    chef.user?.setActivity("mit Schulzi");
});
chef.on("error", console.error);
chef.login(process.env.DISCORD_CHEF_CLIENT_ID);
/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this.valueOf(), min), max);
};
//# sourceMappingURL=index.js.map