//
// Created on Wed Feb 03 2021
//
// Copyright (c) Valentin Walter 2021
//

// NOTICE
// This is code from the old version. I intended to
// reimplement this with SQLite but did not have the time.

import Discord from "discord.js"
import Constants from "../struct/constants"
import Airtable from "airtable"
import Database from "../struct/database"

const airtableBase = Airtable.base(process.env.AIRTABLE_BASE!)

// [category: [items]]
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
			return new Discord.MessageEmbed()
				.setTitle(error)
				.setColor(Constants.colors.red)
		}
	}

	public getCheck(message: Discord.Message): Discord.MessageEmbed {
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

			if (!message.member) return insufficientBalance()
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
					return new Discord.MessageEmbed()
						.setTitle("Zahlung erfolgreich.")
						.setColor(0x00e500)
						.setDescription(`${(balance - sum).toFixed(2)} Gulden übrig.`)
				} else {
					return insufficientBalance()
				}
			} else {
				return insufficientBalance()
			}
		} else {
			return new Discord.MessageEmbed()
				.setTitle("Keine Rechnung vorhanden.")
				.setColor(Constants.colors.red)
				.setDescription(`Bestell Essen mit \`?bestell …\` (#speisekarte)!`)
		}
	}

	public async order(items: string[], userID: string): Promise<string> {
		return new Promise((resolve, reject) => {
			airtableBase("Speisekarte")
				.select({ view: "Winter Saison" })
				.eachPage(
					(records, fetchNextPage) => {
						let itemsFound = 0
						const messages = new Array<string>()
						records.forEach((record) => {
							const name: string = record.get("Gericht")
							const _items = items.map((item) => item.toLowerCase())
							const set = new Set(_items)
							if (set.has(name.toLowerCase())) {
								const price: number = record.get("Preis")
								const menuItem = new MenuItem(name, price)
								let items = this.tabs.get(userID)
								if (items) items.push(menuItem)
								else items = [menuItem]

								this.tabs.set(userID, items)
								itemsFound += 1
								messages.push(`\`${price}€\` (${name})`)
							}
						})

						if (itemsFound != items.length) fetchNextPage()
						else resolve(`chef dankt für die ${messages.join(" — ")}`)
					},
					(error) => {
						if (error) {
							console.error(error)
							reject(`\`${error}\``)
						}
					}
				)
		})
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
		const timeSinceLastCache = new Date().valueOf() - (lastCacheDate?.valueOf() ?? 0)
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
				}
			)
	})
}

function insufficientBalance(): Discord.MessageEmbed {
	const embed = new Discord.MessageEmbed()
		.setTitle("Du hast nicht genügend Geld.")
		.setDescription("broke ass mf")
		.setColor(Constants.colors.red)
		.addField(
			"Interaktion mit Server",
			"• 10 Gulden für eine Nachricht jede Minute.\n• Gulde für alle 10 sekunden in einem beliebigen Voice Channel."
		)
		.addField("Casino", "• ±∞ Gulden mit `?coinflip [wette]`.")
	return embed
}
