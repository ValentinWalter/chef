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
const discord_js_1 = require("discord.js");
const simple_youtube_api_1 = __importDefault(require("simple-youtube-api"));
const discord_js_commando_1 = __importDefault(require("discord.js-commando"));
class Chef extends discord_js_commando_1.default.CommandoClient {
    constructor(options) {
        super(options);
        this.youtube = new simple_youtube_api_1.default(process.env.YOUTUBE_API_KEY);
        this.queues = new discord_js_1.Collection();
    }
}
exports.default = Chef;
//# sourceMappingURL=chef.js.map