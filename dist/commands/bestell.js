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
exports.BestellCommand = void 0;
const command_1 = __importDefault(require("../struct/command"));
class BestellCommand extends command_1.default {
    constructor(chef) {
        super(chef, {
            name: "bestell",
            aliases: ["order", "get"],
            group: "restaurant",
            memberName: "bestell",
            description: "bestell essen aus chefs welt bekannter küche",
            args: [
                {
                    key: "order",
                    prompt: "was willst du bestellen",
                    type: "string",
                },
            ],
        });
    }
    async run(message, args) {
        if (args.order.toLowerCase() == "den thymian" ||
            args.order.toLowerCase() == "thymian") {
            const thymian = [
                "Käsespätzle",
                "Lasagne",
                "Schnitzel",
                "Whiskey",
                "Crepes",
                "Eis",
                "Salatplatte",
                "Bratkartoffeln",
            ];
            const order = await this.chef.restaurant.order(thymian, message.author.id);
            return message.say(order);
        }
        else {
            const items = args.order.split(" ");
            const order = await this.chef.restaurant.order(items, message.author.id);
            return message.say(order);
        }
    }
}
exports.BestellCommand = BestellCommand;
//# sourceMappingURL=bestell.js.map