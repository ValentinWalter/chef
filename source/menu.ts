import { Message, MessageEmbed } from "discord.js"
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
export function sendMenu(message: Message) {
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
                var embed = new MessageEmbed()
                    .setTitle("Saisonale Speisekarte")
                    .setColor(0xb65e16)
                    .setDescription("Mit Liebe vom Chef.")

                for (let key of menu.keys()) {
                    let value = menu.get(key)
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
export function getCheck(message: Message) {
    let _items = tabs.get(message.author.id)
    if (_items) {
        let items = _items
            .map(item => { return ` • ${item.name} **${item.price}€**` })
            .join("\n")
        let sum = _items
            .map(item => { return item.price })
            .reduce((result, current) => {
                return result + current
            })

        let voiceChannel = message.member.voice.channel.name

        var embed = new MessageEmbed()
            .setTitle("Restaurant Wucherwald Promenade")
            .setColor(0xb65e16)
            .setDescription(`*Rechnung für ${message.member.nickname}*`)

        if (voiceChannel)
            embed.addField("Tisch", voiceChannel, true)

        embed
            .addField("Kellner", "Schulz", true)
            .addField("Bestellung", items)
            .addField("Total", `**${(sum * 1.08).toFixed(2)}€** (Inkl. 8% MwSt.)`)
            .setFooter("Chef dankt für Ihren Besuch!")
            .setTimestamp()

        message.channel.send(embed)
    } else {
        let embed = new MessageEmbed()
            .setTitle("Keine Rechnung vorhanden.")
            .setColor(0xff0000)
            .setFooter("Chef ermutigt sie sein Essen zu kaufen!")

        message.channel.send(embed)
    }
}

export function order(item: string, message: Message) {
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