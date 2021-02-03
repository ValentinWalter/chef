//
// Created on Thu Jan 28 2021
//
// Copyright (c) Valentin Walter 2021
//

import Discord, { Collection } from "discord.js"
import Commando from "discord.js-commando"
import Command from "../struct/command"
import Chef from "../struct/chef"
import Constants from "../struct/constants"

export class SlotsCommand extends Command {
	readonly fruits = ["🍎", "🍊", "🍋", "🍉", "🍇", "🥥", "🥝", "🌽", "🌶", "🍒"]
	readonly jewelry = ["💎", "🍀", "👑"]

	constructor(chef: Chef) {
		super(chef, {
			name: "slots",
			aliases: [],
			group: "casino",
			memberName: "slots",
			description: "SLOTS!!!",
			args: [
				{
					key: "bet",
					prompt: "wie viel willst du wetten?",
					type: "integer",
					min: 1,
				},
				{
					key: "mode",
					prompt: "welcher modus? normal/hard?",
					type: "string",
					default: "normal",
				},
			],
		})
	}

	run(
		message: Commando.CommandoMessage,
		args: { bet: number; mode: "normal" | "hard" }
	): Promise<Commando.CommandoMessage> {
		// Create array of five random fruits
		const fruits = [
			this.getRandomFruit(),
			this.getRandomFruit(),
			this.getRandomFruit(),
			this.getRandomFruit(),
			this.getRandomFruit(),
		]

		// Calculate most frequent fruit based on mode
		const results: [fruit: string, count: number] = ["", 0]

		switch (args.mode) {
			// Normal mode:
			case "normal": {
				const occurrences: { [fruit: string]: number } = {}
				let mostFrequentFruit = ""
				let maxCount = 0
				for (const fruit of fruits) {
					if (!occurrences[fruit]) occurrences[fruit] = 1
					else occurrences[fruit]++
					if (occurrences[fruit] > maxCount) {
						mostFrequentFruit = fruit
						maxCount = occurrences[fruit]
					}
				}
				results[0] = mostFrequentFruit
				results[1] = maxCount
				break
			}
			// Hard mode: a streak is required
			case "hard": {
				let lastFruit
				let temporaryStreak = new Array<string>()
				for (const fruit of fruits) {
					if (!lastFruit || lastFruit != fruit) temporaryStreak = []

					temporaryStreak.push(fruit)
					lastFruit = fruit

					if (temporaryStreak.length > results[1]) {
						results[1] = temporaryStreak.length
					}
					results[0] = lastFruit
				}
				break
			}
			default: {
				return this.chef.errorMessage("modus nicht existent", message)
			}
		}

		// Calculate winnings
		let multiplier = 0
		const fruit = results[0]
		const count = results[1] - 2
		if (this.jewelry.includes(fruit)) {
			multiplier = 10 ** count
		} else {
			multiplier = 2 ** count
		}
		if (multiplier == 1) multiplier = 0
		if (args.mode == "hard") multiplier *= 2
		const finalWinnings = args.bet * multiplier

		// Create and return embed message
		const embed = new Discord.MessageEmbed()
			.setTitle(fruits.join(""))
			.setAuthor(
				`${message.member?.displayName}s slots (${args.mode})`,
				message.member?.user.displayAvatarURL()
			)
			.setDescription(
				multiplier > 1
					? `**${multiplier}x!!** Du gewinnst ${finalWinnings} Gulden!`
					: `Du verlierst ${args.bet} Gulden…`
			)
			.setColor(multiplier > 1 ? Constants.colors.green : Constants.colors.red)

		return message.say(embed)
	}

	getRandomFruit(): string {
		const fruitOrJewelry = Math.random()
		if (fruitOrJewelry < 0.9) {
			const i = Math.floor(Math.random() * 3)
			return this.fruits[i]
		} else {
			const i = Math.floor(Math.random() * 1)
			return this.jewelry[i]
		}
	}
}

type RandomFruitOptions = {
	isJewelry: number
	fruits: number
	jewelries: number
}
