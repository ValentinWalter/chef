"use strict";
//
// Created on Wed Jan 26 2021
//
// Copyright (c) Valentin Walter 2021
//
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSession = void 0;
const discord_js_1 = __importStar(require("discord.js"));
const simple_youtube_api_1 = __importDefault(require("simple-youtube-api"));
const discord_js_commando_1 = __importDefault(require("discord.js-commando"));
const constants_1 = __importDefault(require("../struct/constants"));
const restaurant_1 = __importDefault(require("../struct/restaurant"));
class Chef extends discord_js_commando_1.default.CommandoClient {
    constructor(options) {
        super(options);
        this.restaurant = new restaurant_1.default();
        this.youtube = new simple_youtube_api_1.default(process.env.YOUTUBE_API_KEY);
        this.queues = new discord_js_1.Collection();
        this.sessions = new discord_js_1.Collection();
    }
    errorMessage(error, message) {
        const embed = new discord_js_1.default.MessageEmbed()
            .setAuthor(message.member?.displayName, message.author.displayAvatarURL())
            .setTitle(error)
            .setColor(constants_1.default.colors.red);
        return message.say(embed);
    }
}
exports.default = Chef;
class GameSession {
    constructor(game, member, message) {
        this.game = game;
        this.member = member;
        this.message = message;
    }
}
exports.GameSession = GameSession;
//# sourceMappingURL=chef.js.map