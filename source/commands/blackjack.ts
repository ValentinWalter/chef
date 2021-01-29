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

		const storedSessions = this.chef.sessions.get(message.author.id)
		if (storedSessions) {
			return this.errorMessage("spiel zu ende du unwürdiger", message)
		} else {
			const game = new Blackjack.Game()
			const member = message.member ?? undefined
			this.session = new GameSession(game, member)
			this.chef.sessions.set(message.author.id, this.session)
		}

		try {
			// Act out current game stage
			const results = await this.playCurrentStage(message)
			// Delete entry at end
			this.chef.sessions.delete(message.author.id)
			// Display end result
			return message.say(this.gameFinishEmbed(results[0], results[1]))
		} catch (error) {
			this.chef.sessions.delete(message.author.id)
			if (error == "timeout")
				return this.errorMessage(
					"chef ist eingeschlafen während er auf dich gewartet hat",
					message
				)
			console.error(error)
			throw error
		}
	}

	private async playCurrentStage(
		originalMessage: Discord.Message
	): Promise<[conclusion: string, color: number]> {
		const state = this.session.game.getState()
		const game = this.session.game
		switch (state.stage) {
			case "ready": {
				// Deal hand
				game.dispatch(actions.deal({ bet: this.bet }))
				return await this.playCurrentStage(originalMessage)
			}
			case "player-turn-right": {
				const embed = this.playerTurnEmbed()
				if (!this.session.message) {
					const embedMessage = await originalMessage.channel.send(embed)
					this.session.message = embedMessage
				} else {
					this.session.message.edit(embed)
				}

				const filter = (message: Discord.Message) => {
					const commands = ["hit", "stay", "double"]
					const isCommand = commands.includes(message.content)
					const isPlayer = message.author.id == originalMessage.author.id
					return isCommand && isPlayer
				}
				const inputs = await originalMessage.channel.awaitMessages(filter, {
					max: 1,
					time: 300000,
				})
				const input = inputs.first()
				if (!input) throw "timeout"

				switch (input.content) {
					case "hit":
						game.dispatch(actions.hit({ position: "right" }))
						break
					case "stay":
						game.dispatch(actions.stand({ position: "right" }))
						break
					case "double":
						game.dispatch(actions.double({ position: "right" }))
						break
				}

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
				let conclusion = ""
				let color = 0x000
				if (state.dealerHasBlackjack) {
					// Dealer has blackjack
					conclusion = `Chef hat Blackjack! Du verlierst **${state.finalBet}** Gulden!`
					color = Constants.colors.red
				} else if (state.handInfo.right.playerHasBlackjack) {
					// Player has blackjack
					conclusion = `**Blackjack!** Du gewinnst **${state.finalBet}** Gulden!`
					color = Constants.colors.green
				} else if (state.dealerHasBusted) {
					// Dealer busted
					conclusion = `Dealer busted! Du gewinnst **${state.finalBet}** Gulden!`
					color = Constants.colors.green
				} else if (state.handInfo.right.playerHasBusted) {
					// Player busted
					conclusion = `Busted! Du verlierst **${state.finalBet}** Gulden!`
					color = Constants.colors.red
				} else if (
					state.handInfo.right.playerValue.hi == state.dealerValue.hi
				) {
					// Tie
					conclusion = `Gleichstand… Niemand gewinnt nichts ~`
					color = Constants.colors.gray
				} else if (
					state.handInfo.right.playerValue.hi > state.dealerValue.hi
				) {
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
			default: {
				throw "unknown stage"
			}
		}
	}

	private playerTurnEmbed(): Discord.MessageEmbed {
		const state = this.session.game.getState()
		const hand = state.handInfo.right
		const cards = this.getCards()
		const playerCards = cards.player
			.map((card) => this.toString(card))
			.join(" — ")
		const dealerCards = `${this.toString(cards.dealer[0])}`

		const embed = new Discord.MessageEmbed()
			.setTitle(`Blackjack für ${state.initialBet} Gulden`)
			.setAuthor(
				this.session.member?.displayName,
				this.session.member?.user.avatarURL() ?? undefined
			)
			.setDescription("Antworte mit **hit**, **stay** oder **double**.")
			.addField(
				"Deine Karten",
				`${playerCards}
				Gesamt: ${hand.playerValue.hi}`
			)
			.addField(
				"Chef (Dealer)",
				`${dealerCards} — ??
				Gesamt: ${this.session.game.getState().dealerValue.hi}`
			)
			.setColor(Constants.colors.yellow)

		return embed
	}

	private gameFinishEmbed(
		conclusion: string,
		color: number
	): Discord.MessageEmbed {
		const state = this.session.game.getState()
		const hand = state.handInfo.right
		const cards = this.getCards()
		const playerCards = cards.player
			.map((card) => this.toString(card))
			.join(" — ")
		const dealerCards = cards.dealer
			.map((card) => this.toString(card))
			.join(" — ")

		const embed = new Discord.MessageEmbed()
			.setTitle("Blackjack")
			.setAuthor(
				this.session.member?.displayName,
				this.session.member?.user.avatarURL() ?? undefined
			)
			.setDescription(conclusion)
			.addField(
				"Deine Karten",
				`${playerCards}
				Gesamt: ${hand.playerValue.hi}`
			)
			.addField(
				"Chef (Dealer)",
				`${dealerCards}
				Gesamt: ${state.dealerValue.hi}`
			)
			.setColor(color)

		return embed
	}

	private errorMessage(
		error: string,
		message: Commando.CommandoMessage
	): Promise<Commando.CommandoMessage> {
		const embed = new Discord.MessageEmbed()
			.setAuthor(
				message.member?.displayName,
				message.author.displayAvatarURL()
			)
			.setTitle(error)
			.setColor(Constants.colors.red)
		return message.say(embed)
	}

	private getCards(): Cards {
		const { handInfo, dealerCards } = this.session.game.getState()

		return {
			player: handInfo.right.cards.map((card) => this.toCustomCardType(card)),
			dealer: dealerCards.map((card) => this.toCustomCardType(card)),
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
	player: Card[]
	dealer: Card[]
}

type Card = {
	name: string
	value: number
	suite: string
	emoji: string
}

type Suite = "hearts" | "diamonds" | "clubs" | "spades"
