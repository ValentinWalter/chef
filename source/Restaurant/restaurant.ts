import Discord, { MessageEmbed } from "discord.js"
import Colors from "../Utilities/colors"
import Database from "../database"
import * as Chef from "../main"
import Airtable from "airtable"

const airtableBase = Airtable.base("appVqJApVQAuLIHJm")

// category: [items]
let cachedMenu: Map<string, Set<MenuItem>> | null = null
let lastCacheDate: Date | null = null
// 60 seconds
const cacheTimeout = 60 * 1000

export default class Restaurant {
	// userID: [items]
	tabs = new Map<string, MenuItem[]>()

	// Parse menu.csv
	public async menu(): Promise<Discord.MessageEmbed> {
		try {
			const menu = await fetchMenu()
			lastCacheDate = new Date()

			const embed = new Discord.MessageEmbed()
				.setTitle("Saisonale Speisekarte")
				.setColor(0xb65e16)
				.setDescription("Mit Liebe vom Chef.")

			for (const key of menu.keys()) {
				const value = Array.from(menu.get(key)!)
					.map((item) => {
						return `• ${item.name} **${item.price}€**`
					})
					.join("\n")
				embed.addField(key, value)
			}

			return embed
		} catch (error) {
			console.error(error)
			return new Discord.MessageEmbed().setTitle(error).setColor(Colors.error)
		}
	}

	public getCheck(message: Discord.Message) {
		const _items = this.tabs.get(message.author.id)
		if (_items) {
			const sum =
				_items
					.map((item) => {
						return item.price
					})
					.reduce((result, current) => {
						return result + current
					}) * 1.08

			if (sum > 50) _items.push(new MenuItem("Schnaps aufs Haus", 0))

			const items = _items
				.map((item) => {
					return ` • ${item.name} **${item.price}€**`
				})
				.join("\n")

			if (!message.member) return
			const voiceChannel = message.member.voice.channel

			const menuEmbed = new Discord.MessageEmbed()
				.setTitle("Restaurant Wucherwald Promenade")
				.setColor(0xb65e16)
				.setDescription(`*Rechnung für ${message.member.displayName}*`)
				.setTimestamp()

			if (voiceChannel) {
				menuEmbed.addField("Tisch", voiceChannel.name, true)
			} else {
				menuEmbed.addField("Tisch", Math.floor(Math.random() * 5), true)
			}

			menuEmbed
				.addField("Kellner", "Schulz", true)
				.addField("Bestellung", items)
				.addField("Total", `**${sum.toFixed(2)}€** (Inkl. 8% MwSt.)`)

			if (sum > 50) {
				menuEmbed.setFooter("Chef lässt grüßen!")
			} else {
				menuEmbed.setFooter("Chef dankt für Ihren Besuch!")
			}

			message.channel.send(menuEmbed)

			const balance = Database.getBalance(message.author.id)
			if (balance) {
				if (balance > sum) {
					Database.addToBalance(-sum, message.author.id)
					const embed = new Discord.MessageEmbed()
						.setTitle("Zahlung erfolgreich.")
						.setColor(0x00e500)
						.setDescription(`${(balance - sum).toFixed(2)} Gulden übrig.`)
					message.channel.send(embed)
				} else {
					insufficientBalance(message.channel)
				}
			} else {
				insufficientBalance(message.channel)
			}
		} else {
			const embed = new Discord.MessageEmbed()
				.setTitle("Keine Rechnung vorhanden.")
				.setColor(Colors.error)
				.setDescription(
					`Bestell Essen mit \`${Chef.prefix}bestell …\` (#speisekarte)!`,
				)

			message.channel.send(embed)
		}
	}

	public order(items: string[], message: Discord.Message) {
		airtableBase("Speisekarte")
			.select({ view: "Winter Saison" })
			.eachPage(
				(records, fetchNextPage) => {
					let foundItem = false
					records.forEach((record) => {
						const name: string = record.get("Gericht")
						const _items = items.map((item) => item.toLowerCase())
						const set = new Set(_items)
						if (set.has(name.toLowerCase())) {
							const price: number = record.get("Preis")
							const menuItem = new MenuItem(name, price)
							let items = this.tabs.get(message.author.id)
							if (items) items.push(menuItem)
							else items = [menuItem]

							this.tabs.set(message.author.id, items)
							message.react("👌")
							message.channel.send(`chef dankt für die ${price}€ (${name})`)
							foundItem = true
							return
						}
					})

					if (!foundItem) fetchNextPage()
					else return
				},
				(error: any) => {
					if (error) {
						console.error(error)
						message.reply(`\`${error}\``)
						return
					}
				},
			)
	}
}

class MenuItem {
	name: string
	price: number

	constructor(name: string, price: number) {
		this.price = price
		this.name = name
	}
}

function fetchMenu() {
	return new Promise<Map<string, Set<MenuItem>>>((resolve, reject) => {
		// Cache logic
		const timeSinceLastCache =
			new Date().valueOf() - (lastCacheDate?.valueOf() ?? 0)
		if (cachedMenu && timeSinceLastCache < cacheTimeout) {
			resolve(cachedMenu)
		}

		// Fetch from Airtable
		const menu = new Map<string, Set<MenuItem>>()
		airtableBase("Speisekarte")
			.select({ view: "Winter Saison" })
			.eachPage(
				(records, fetchNextPage) => {
					records.forEach((record: { get: (arg0: string) => any }) => {
						const name: string = record.get("Gericht")
						const price: number = record.get("Preis")
						const category: string = record.get("Kategorie")

						const item = new MenuItem(name, price)
						let items = menu.get(category)
						if (items) {
							items.add(item)
						} else {
							items = new Set([item])
						}

						menu.set(category, items)
					})

					fetchNextPage()
				},
				(error) => {
					if (error) {
						reject(error)
					} else {
						cachedMenu = menu
						resolve(menu)
					}
				},
			)
	})
}

function insufficientBalance(
	channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
) {
	const embed = new Discord.MessageEmbed()
		.setTitle("Du hast nicht genügend Geld.")
		.setDescription("broke ass mf")
		.setColor(Colors.error)
		.addField(
			"Interaktion mit Server",
			"• 10 Gulden für eine Nachricht jede Minute.\n• Gulde für alle 10 sekunden in einem beliebigen Voice Channel.",
		)
		.addField("Casino", "• ±∞ Gulden mit `?coinflip [wette]`.")
	channel.send(embed)
}
