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
const path_1 = __importDefault(require("path"));
const chef_1 = __importDefault(require("./struct/chef"));
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
//# sourceMappingURL=index.js.map