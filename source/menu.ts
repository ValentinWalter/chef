import * as Discord from "discord.js"
import { prefix, users } from "./main"
const base = require('airtable').base('appVqJApVQAuLIHJm')

// category: [items]
var menu = new Map<string, MenuItem[]>()
// userID: [items]
var tabs = new Map<string, MenuItem[]>()

class MenuItem {
    name: string
    price: number

    constructor(name: string, price: number) {
        this.price = price
        this.name = name
    }
}

// Parse menu.csv
export function sendMenu(message: Discord.Message) {
    base("Speisekarte")
        .select({ view: "Winter Saison" })
        .eachPage((records: any[], fetchNextPage: () => void) => {
            records.forEach((record: { get: (arg0: string) => any }) => {
                let name: string = record.get("Gericht")
                let price: number = record.get("Preis")
                let category: string = record.get("Kategorie")

                let item = new MenuItem(name, price)
                var items = menu.get(category)
                if (items)
                    items.push(item)
                else
                    items = [item]

                menu.set(category, items)
            })

            fetchNextPage()
        }, (error: any) => {
            if (!error) {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Saisonale Speisekarte")
                    .setColor(0xb65e16)
                    .setDescription("Mit Liebe vom Chef.")

                for (let key of menu.keys()) {
                    let value = menu.get(key)!
                        .map(item => {
                            return `${item.name} **${item.price}€**`
                        })
                        .join("\n")
                    embed.addField(key, value)
                }

                message.channel.send(embed)
            } else {
                console.error(error)
                message.reply(`\`${error}\``)
                return
            }
        })
}

// API
export function getCheck(message: Discord.Message) {
    let _items = tabs.get(message.author.id)
    if (_items) {
        let items = _items
            .map(item => { return ` • ${item.name} **${item.price}€**` })
            .join("\n")
        var sum = _items
            .map(item => { return item.price })
            .reduce((result, current) => {
                return result + current
            })
            * 1.08

        if (!message.member) return
        let voiceChannel = message.member.voice.channel

        var embed = new Discord.MessageEmbed()
            .setTitle("Restaurant Wucherwald Promenade")
            .setColor(0xb65e16)
            .setDescription(`*Rechnung für ${message.member.displayName}*`)

        if (voiceChannel)
            embed.addField("Tisch", voiceChannel.name, true)
        else
            embed.addField("Tisch", Math.floor(Math.random() * 5), true)

        embed
            .addField("Kellner", "Schulz", true)
            .addField("Bestellung", items)
            .addField("Total", `**${sum.toFixed(2)}€** (Inkl. 8% MwSt.)`)
            .setFooter("Chef dankt für Ihren Besuch!")
            .setTimestamp()

        message.channel.send(embed)

        let user = users.get(message.author.id)
        if (user) {
            if (user.balance > sum) {
                user.balance -= sum
                users.set(message.author.id, user)
                let embed = new Discord.MessageEmbed()
                    .setTitle("Zahlung erfolgreich.")
                    .setColor(0x00E500)
                // .setDescription(`${getBalance(message.author.id).toFixed(2)}€ übrig.`)
                message.channel.send(embed)
            } else {
                insufficientBalance(message.channel)
            }
        } else {
            insufficientBalance(message.channel)
        }
    } else {
        let embed = new Discord.MessageEmbed()
            .setTitle("Keine Rechnung vorhanden.")
            .setColor(0xff0000)
            .setDescription(`Bestell Essen mit \`${prefix}bestell …\` (#speisekarte)!`)

        message.channel.send(embed)
    }
}

export function order(item: string, message: Discord.Message) {
    base("Speisekarte")
        .select({ view: "Winter Saison" })
        .eachPage((records: any[], fetchNextPage: () => void) => {
            var foundItem = false
            records.forEach((record: { get: (arg0: string) => any }) => {
                let name: string = record.get("Gericht")
                if (name.toLowerCase() == item.toLowerCase()) {
                    let price: number = record.get("Preis")
                    let item = new MenuItem(name, price)
                    var items = tabs.get(message.author.id)
                    if (items)
                        items.push(item)
                    else
                        items = [item]

                    tabs.set(message.author.id, items)
                    message.react("👌")
                    message.channel.send(`chef dankt für die ${price}€`)
                    foundItem = true
                    return
                }
            })

            if (!foundItem) fetchNextPage()
            else return
        }, (error: any) => {
            if (error) {
                console.error(error)
                message.reply(`\`${error}\``)
                return
            }
        })
}

function insufficientBalance(channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel) {
    let embed = new Discord.MessageEmbed()
        .setTitle("Du hast nicht genügend Geld.")
        .setDescription("Verdien Geld in dem du mit dem Server interagierst.")
        .setColor(0xff0000)
        .addField("1", "1€ für alle 10 sekunden in einem beliebigen Voice Channel.")
        .addField("2", "10€ für eine Nachricht jede Minute.")
    channel.send(embed)
}