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
// NOTICE
// This is code from the old version. I intended to
// reimplement this with SQLite but did not have the time.
const discord_js_1 = __importDefault(require("discord.js"));
const constants_1 = __importDefault(require("../struct/constants"));
const airtable_1 = __importDefault(require("airtable"));
const database_1 = __importDefault(require("../struct/database"));
const airtableBase = airtable_1.default.base(process.env.AIRTABLE_BASE);
// [category: [items]]
let cachedMenu = null;
let lastCacheDate = null;
// 60 seconds
const cacheTimeout = 60 * 1000;
class Restaurant {
    constructor() {
        // userID: [items]
        this.tabs = new Map();
    }
    // Parse menu.csv
    async menu() {
        try {
            const menu = await fetchMenu();
            lastCacheDate = new Date();
            const embed = new discord_js_1.default.MessageEmbed()
                .setTitle("Saisonale Speisekarte")
                .setColor(0xb65e16)
                .setDescription("Mit Liebe vom Chef.");
            for (const key of menu.keys()) {
                const value = Array.from(menu.get(key))
                    .map((item) => {
                    return `• ${item.name} **${item.price}€**`;
                })
                    .join("\n");
                embed.addField(key, value);
            }
            return embed;
        }
        catch (error) {
            console.error(error);
            return new discord_js_1.default.MessageEmbed()
                .setTitle(error)
                .setColor(constants_1.default.colors.red);
        }
    }
    getCheck(message) {
        const _items = this.tabs.get(message.author.id);
        if (_items) {
            const sum = _items
                .map((item) => {
                return item.price;
            })
                .reduce((result, current) => {
                return result + current;
            }) * 1.08;
            if (sum > 50)
                _items.push(new MenuItem("Schnaps aufs Haus", 0));
            const items = _items
                .map((item) => {
                return ` • ${item.name} **${item.price}€**`;
            })
                .join("\n");
            if (!message.member)
                return insufficientBalance();
            const voiceChannel = message.member.voice.channel;
            const menuEmbed = new discord_js_1.default.MessageEmbed()
                .setTitle("Restaurant Wucherwald Promenade")
                .setColor(0xb65e16)
                .setDescription(`*Rechnung für ${message.member.displayName}*`)
                .setTimestamp();
            if (voiceChannel) {
                menuEmbed.addField("Tisch", voiceChannel.name, true);
            }
            else {
                menuEmbed.addField("Tisch", Math.floor(Math.random() * 5), true);
            }
            menuEmbed
                .addField("Kellner", "Schulz", true)
                .addField("Bestellung", items)
                .addField("Total", `**${sum.toFixed(2)}€** (Inkl. 8% MwSt.)`);
            if (sum > 50) {
                menuEmbed.setFooter("Chef lässt grüßen!");
            }
            else {
                menuEmbed.setFooter("Chef dankt für Ihren Besuch!");
            }
            message.channel.send(menuEmbed);
            const balance = database_1.default.getBalance(message.author.id);
            if (balance) {
                if (balance > sum) {
                    database_1.default.addToBalance(-sum, message.author.id);
                    return new discord_js_1.default.MessageEmbed()
                        .setTitle("Zahlung erfolgreich.")
                        .setColor(0x00e500)
                        .setDescription(`${(balance - sum).toFixed(2)} Gulden übrig.`);
                }
                else {
                    return insufficientBalance();
                }
            }
            else {
                return insufficientBalance();
            }
        }
        else {
            return new discord_js_1.default.MessageEmbed()
                .setTitle("Keine Rechnung vorhanden.")
                .setColor(constants_1.default.colors.red)
                .setDescription(`Bestell Essen mit \`?bestell …\` (#speisekarte)!`);
        }
    }
    async order(items, userID) {
        return new Promise((resolve, reject) => {
            airtableBase("Speisekarte")
                .select({ view: "Winter Saison" })
                .eachPage((records, fetchNextPage) => {
                let itemsFound = 0;
                const messages = new Array();
                records.forEach((record) => {
                    const name = record.get("Gericht");
                    const _items = items.map((item) => item.toLowerCase());
                    const set = new Set(_items);
                    if (set.has(name.toLowerCase())) {
                        const price = record.get("Preis");
                        const menuItem = new MenuItem(name, price);
                        let items = this.tabs.get(userID);
                        if (items)
                            items.push(menuItem);
                        else
                            items = [menuItem];
                        this.tabs.set(userID, items);
                        itemsFound += 1;
                        messages.push(`\`${price}€\` (${name})`);
                    }
                });
                if (itemsFound != items.length)
                    fetchNextPage();
                else
                    resolve(`chef dankt für die ${messages.join(" — ")}`);
            }, (error) => {
                if (error) {
                    console.error(error);
                    reject(`\`${error}\``);
                }
            });
        });
    }
}
exports.default = Restaurant;
class MenuItem {
    constructor(name, price) {
        this.price = price;
        this.name = name;
    }
}
function fetchMenu() {
    return new Promise((resolve, reject) => {
        // Cache logic
        const timeSinceLastCache = new Date().valueOf() - (lastCacheDate?.valueOf() ?? 0);
        if (cachedMenu && timeSinceLastCache < cacheTimeout) {
            resolve(cachedMenu);
        }
        // Fetch from Airtable
        const menu = new Map();
        airtableBase("Speisekarte")
            .select({ view: "Winter Saison" })
            .eachPage((records, fetchNextPage) => {
            records.forEach((record) => {
                const name = record.get("Gericht");
                const price = record.get("Preis");
                const category = record.get("Kategorie");
                const item = new MenuItem(name, price);
                let items = menu.get(category);
                if (items) {
                    items.add(item);
                }
                else {
                    items = new Set([item]);
                }
                menu.set(category, items);
            });
            fetchNextPage();
        }, (error) => {
            if (error) {
                reject(error);
            }
            else {
                cachedMenu = menu;
                resolve(menu);
            }
        });
    });
}
function insufficientBalance() {
    const embed = new discord_js_1.default.MessageEmbed()
        .setTitle("Du hast nicht genügend Geld.")
        .setDescription("broke ass mf")
        .setColor(constants_1.default.colors.red)
        .addField("Interaktion mit Server", "• 10 Gulden für eine Nachricht jede Minute.\n• Gulde für alle 10 sekunden in einem beliebigen Voice Channel.")
        .addField("Casino", "• ±∞ Gulden mit `?coinflip [wette]`.");
    return embed;
}
//# sourceMappingURL=restaurant.js.map