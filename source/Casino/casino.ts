import Discord from "discord.js"
import Database from "../database"

export default class Casino {
	public coinflip(bet: number, message: Discord.Message): void {
		if (bet) {
			if (Math.random() < 0.49) {
				Database.addToBalance(bet, message.author.id)
				const embed = new Discord.MessageEmbed()
					.setTitle(`Du hast ${bet} Gulden gewonnen!`)
					.setColor(0x00e500)
				message.channel.send(embed)
			} else {
				Database.addToBalance(-bet, message.author.id)
				const embed = new Discord.MessageEmbed()
					.setTitle(`Du hast ${bet} Gulden verloren.`)
					.setColor(0xff0000)
				message.channel.send(embed)
			}
		}
	}
}
