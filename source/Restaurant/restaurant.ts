import Discord from "discord.js"
import Colors from "../Utilities/colors"
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
						return `${item.name} **${item.price}€**`
					})
					.join("\n")
				embed.addField(key, value)
			}

			return embed
		}
		catch (error) {
			console.error(error)
			return new Discord.MessageEmbed().setTitle(error).setColor(Colors.error)
		}
	}

	public getCheck(message: Discord.Message) {
		const _items = this.tabs.get(message.author.id)
		if (_items) {
			const items = _items
				.map((item) => {
					return ` • ${item.name} **${item.price}€**`
				})
				.join("\n")
			const sum =
				_items
					.map((item) => {
						return item.price
					})
					.reduce((result, current) => {
						return result + current
					}) * 1.08

			if (!message.member) return
			const voiceChannel = message.member.voice.channel

			const menuEmbed = new Discord.MessageEmbed()
				.setTitle("Restaurant Wucherwald Promenade")
				.setColor(0xb65e16)
				.setDescription(`*Rechnung für ${message.member.displayName}*`)

			if (voiceChannel) {
				menuEmbed.addField("Tisch", voiceChannel.name, true)
			}
			else {
				menuEmbed.addField("Tisch", Math.floor(Math.random() * 5), true)
			}

			menuEmbed
				.addField("Kellner", "Schulz", true)
				.addField("Bestellung", items)
				.addField("Total", `**${sum.toFixed(2)}€** (Inkl. 8% MwSt.)`)
				.setFooter("Chef dankt für Ihren Besuch!")
				.setTimestamp()

			message.channel.send(menuEmbed)

			const user = Chef.users.get(message.author.id)
			if (user) {
				if (user.balance > sum) {
					user.balance -= sum
					Chef.users.set(message.author.id, user)
					const embed = new Discord.MessageEmbed()
						.setTitle("Zahlung erfolgreich.")
						.setColor(0x00e500)
					// .setDescription(`${getBalance(message.author.id).toFixed(2)}€ übrig.`)
					message.channel.send(embed)
				}
				else {
					insufficientBalance(message.channel)
				}
			}
			else {
				insufficientBalance(message.channel)
			}
		}
		else {
			const embed = new Discord.MessageEmbed()
				.setTitle("Keine Rechnung vorhanden.")
				.setColor(Colors.error)
				.setDescription(
					`Bestell Essen mit \`${Chef.prefix}bestell …\` (#speisekarte)!`,
				)

			message.channel.send(embed)
		}
	}

	public order(item: string, message: Discord.Message) {
		airtableBase("Speisekarte")
			.select({ view: "Winter Saison" })
			.eachPage(
				(records: any[], fetchNextPage: () => void) => {
					let foundItem = false
					records.forEach(record => {
						const name: string = record.get("Gericht")
						if (name.toLowerCase() == item.toLowerCase()) {
							const price: number = record.get("Preis")
							const menuItem = new MenuItem(name, price)
							let items = this.tabs.get(message.author.id)
							if (items) items.push(menuItem)
							else items = [menuItem]

							this.tabs.set(message.author.id, items)
							message.react("👌")
							message.channel.send(`chef dankt für die ${price}€`)
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
						}
						else {
							items = new Set([item])
						}

						menu.set(category, items)
					})

					fetchNextPage()
				},
				(error) => {
					if (error) {
						reject(error)
					}
					else {
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
		.setDescription("Verdien Geld in dem du mit dem Server interagierst.")
		.setColor(Colors.error)
		.addField("1", "1€ für alle 10 sekunden in einem beliebigen Voice Channel.")
		.addField("2", "10€ für eine Nachricht jede Minute.")
	channel.send(embed)
}
