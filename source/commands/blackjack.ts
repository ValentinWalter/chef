//
// Created on Thu Jan 28 2021
//
// Copyright (c) Valentin Walter 2021
//

import Discord from "discord.js"
import Commando from "discord.js-commando"
import * as Blackjack from "engine-blackjack-ts"
import { actions } from "engine-blackjack-ts"
import Command from "../struct/command"
import Chef, { GameSession } from "../struct/chef"
import Constants from "../struct/constants"

export class BlackjackCommand extends Command {
	session: GameSession
	bet = 0

	constructor(chef: Chef) {
		super(chef, {
			name: "blackjack",
			aliases: ["bj"],
			group: "casino",
			memberName: "blackjack",
			description: "Eine Runde Blackjack.",
			args: [
				{
					key: "bet",
					prompt: "wie viel willst du wetten?",
					type: "integer",
					min: 1,
				},
			],
		})
		const game = new Blackjack.Game()
		this.session = new GameSession(game)
	}

	async run(
		message: Commando.CommandoMessage,
		args: { bet: number }
	): Promise<Commando.CommandoMessage> {
		this.bet = args.bet

		// See if player already has a running session
		const storedSessions = this.chef.sessions.get(message.author.id)
		if (storedSessions) {
			return this.chef.errorMessage("spiel zu ende du unwürdiger", message)
		} else {
			// Create new session for this blackjack game
			const game = new Blackjack.Game()
			const member = message.member ?? undefined
			this.session = new GameSession(game, member)
			this.chef.sessions.set(message.author.id, this.session)
		}

		try {
			// Act out current game stage
			const embed = await this.playCurrentStage(message)
			// Delete entry at end
			this.chef.sessions.delete(message.author.id)
			// Display end result
			return message.say(embed)
		} catch (error) {
			this.chef.sessions.delete(message.author.id)
			if (error == "timeout")
				return this.chef.errorMessage(
					"chef ist eingeschlafen während er auf dich gewartet hat",
					message
				)
			console.error(error)
			throw error
		}
	}

	private async playCurrentStage(
		originalMessage: Discord.Message
	): Promise<Discord.MessageEmbed> {
		const state = this.session.game.getState()
		const game = this.session.game
		switch (state.stage) {
			case "ready": {
				// Deal hand
				game.dispatch(actions.deal({ bet: this.bet }))
				return await this.playCurrentStage(originalMessage)
			}
			case "player-turn-right": {
				// if (!this.session.message) {
				// 	const embedMessage = await originalMessage.channel.send(embed)
				// 	this.session.message = embedMessage
				// } else {
				// 	this.session.message.edit(embed)
				// }

				// Display current state
				const embed = this.playerTurnEmbed()
				const embedMessage = await originalMessage.channel.send(embed)
				this.session.message = embedMessage

				// Await player input
				const filter = (message: Discord.Message) => {
					const commands = ["hit", "stay", "split", "double", "insurance"]
					const isCommand = commands.includes(message.content)
					const isPlayer =
						message.author.id == this.session.member?.user.id
					return isCommand && isPlayer
				}
				const inputs = await originalMessage.channel.awaitMessages(filter, {
					max: 1,
					time: 300000,
				})
				const input = inputs.first()
				if (!input) throw "timeout"

				// Act on player input
				switch (input.content) {
					case "hit":
						game.dispatch(actions.hit({ position: "right" }))
						break
					case "stay":
						game.dispatch(actions.stand({ position: "right" }))
						break
					case "split":
						// game.dispatch(actions.split())
						input.reply("funkt leider noch nicht")
						break
					case "double":
						game.dispatch(actions.double({ position: "right" }))
						break
					case "insurance":
						// game.dispatch(actions.insurance({ bet: this.bet / 2 }))
						input.reply("funkt leider noch nicht")
						break
				}

				input.react("👍")

				// Play next stage
				return await this.playCurrentStage(input)
			}
			case "player-turn-left": {
				throw "player-turn-left is an invalid stage"
			}
			case "showdown": {
				throw "showdown is an invalid stage"
			}
			case "dealer-turn": {
				throw "dealer-turn is an invalid stage"
			}
			case "done": {
				const rightHand = state.handInfo.right
				const leftHand = state.handInfo.left
				const [right, color] = this.getConclusionForHand(rightHand, state)
				const [left] = this.getConclusionForHand(leftHand, state)
				return this.gameFinishEmbed(right ?? "error", left, color)
			}
			default: {
				throw "unknown stage"
			}
		}
	}

	private playerTurnEmbed(): Discord.MessageEmbed {
		const state = this.session.game.getState()
		const hand = state.handInfo
		const cards = this.getCards()

		const embed = new Discord.MessageEmbed()
			.setTitle(`Blackjack für ${state.initialBet} Gulden`)
			.setAuthor(
				this.session.member?.displayName,
				this.session.member?.user.avatarURL() ?? undefined
			)
			.setDescription(
				"Antworte mit **hit**, **stay**, **split**, **double** oder **insurance**."
			)
			.addField(
				"Deine rechte Hand",
				`${cards.player.right}
				Gesamt: ${hand.right.playerValue.hi}`,
				true
			)

		if (cards.player.left)
			embed.addField(
				"Deine linke Hand",
				`${cards.player.left}
				Gesamt: ${hand.left.playerValue.hi}`,
				true
			)

		embed
			.addField(
				"Chef (Dealer)",
				`${cards.dealer} — ??
				Gesamt: ${this.session.game.getState().dealerValue.hi}`
			)
			.setColor(Constants.colors.yellow)

		return embed
	}

	private gameFinishEmbed(
		conclusionRight: string,
		conclusionLeft?: string,
		color = 0x000
	): Discord.MessageEmbed {
		const state = this.session.game.getState()
		const hand = state.handInfo
		const cards = this.getCards()

		// Create embed
		const embed = new Discord.MessageEmbed()
			.setAuthor(
				this.session.member?.displayName,
				this.session.member?.user.avatarURL() ?? undefined
			)
			.setDescription(conclusionRight)

		// Add left hand conclusion if it exists
		// if (conclusionLeft) embed.addField(conclusionLeft, "\u200b", true)

		// Add spacer and right hand info
		embed.addField(
			"Deine rechte Hand",
			`${cards.player.right}
				Gesamt: ${hand.right.playerValue.hi}`,
			true
		)

		// Add left hand info if it exists
		// if (cards.player.left)
		// 	embed.addField(
		// 		"Deine link Hand",
		// 		`${cards.player.left}
		// 		Gesamt: ${hand.left.playerValue.hi}`,
		// 		true
		// 	)

		// Add dealer info if it exists
		embed
			.addField(
				"Chef (Dealer)",
				`${cards.dealer}
				Gesamt: ${state.dealerValue.hi}`
			)
			.setColor(color)

		return embed
	}

	getConclusionForHand(
		hand: Blackjack.Hand,
		state: Blackjack.State
	): [conclusion?: string, color?: number] {
		if (!hand.playerValue) return [undefined, undefined]

		let conclusion = ""
		let color = 0x000

		if (hand.playerValue.hi == state.dealerValue.hi) {
			// Push
			conclusion = `Push… Niemand gewinnt nichts ~`
			color = Constants.colors.gray
		} else if (state.dealerHasBlackjack) {
			// Dealer has blackjack
			conclusion = `Chef hat Blackjack! Du verlierst **${state.finalBet}** Gulden!`
			color = Constants.colors.red
		} else if (hand.playerHasBlackjack) {
			// Player has blackjack
			conclusion = `**Blackjack!** Du gewinnst **${state.finalBet}** Gulden!`
			color = Constants.colors.green
		} else if (state.dealerHasBusted) {
			// Dealer busted
			conclusion = `Dealer busted! Du gewinnst **${state.finalBet}** Gulden!`
			color = Constants.colors.green
		} else if (hand.playerHasBusted) {
			// Player busted
			conclusion = `Busted! Du verlierst **${state.finalBet}** Gulden!`
			color = Constants.colors.red
		} else if (hand.playerValue.hi > state.dealerValue.hi) {
			// Player has higher value than dealer
			conclusion = `Du gewinnst **${state.finalBet}** Gulden!`
			color = Constants.colors.green
		} else {
			// Dealer has higher value than player
			conclusion = `Du verlierst **${state.finalBet}** Gulden!`
			color = Constants.colors.red
		}

		return [conclusion, color]
	}

	private getCards(): Cards {
		const { handInfo, dealerCards } = this.session.game.getState()

		let right: string | undefined
		let left: string | undefined

		if (handInfo.right.cards)
			right = handInfo.right.cards
				.map((card) => this.toCustomCardType(card))
				.map((card) => this.toString(card))
				.join(" — ")

		if (handInfo.left.cards)
			left = handInfo.left.cards
				.map((card) => this.toCustomCardType(card))
				.map((card) => this.toString(card))
				.join(" — ")

		return {
			player: {
				right: right,
				left: left,
			},
			dealer: dealerCards
				.map((card) => this.toCustomCardType(card))
				.map((card) => this.toString(card))
				.join(" — "),
		}
	}

	private suiteToEmoji(suite: Suite): string {
		switch (suite) {
			case "hearts":
				return "♥️"
			case "diamonds":
				return "♦️"
			case "clubs":
				return "♣️"
			case "spades":
				return "♠️"
		}
	}

	private toCustomCardType(card: Blackjack.Card): Card {
		return {
			name: card.text,
			value: card.value,
			suite: card.suite,
			emoji: this.suiteToEmoji(card.suite),
		}
	}

	private toString(card: Card) {
		return `${card.name}${card.emoji}`
	}
}

type Cards = {
	player: {
		right?: string
		left?: string
	}
	dealer: string
}

type Card = {
	name: string
	value: number
	suite: string
	emoji: string
}

type Suite = "hearts" | "diamonds" | "clubs" | "spades"
