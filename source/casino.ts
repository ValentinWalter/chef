import * as Discord from "discord.js";

export function coinflip(bet: number, message: Discord.Message) {
    if (bet) {
        if (Math.random() < 0.49) {
            // addToBalance(bet, message.author.id)
            // let embed = new Discord.MessageEmbed()
            //     .setTitle(`Du hast ${bet}€ gewonnen!`)
            //     .setColor(0x00E500)
            // message.channel.send(embed)
        } else {
            // addToBalance(-bet, message.author.id)
            // let embed = new Discord.MessageEmbed()
            //     .setTitle(`Du hast ${bet}€ verloren.`)
            //     .setColor(0xff0000)
            // message.channel.send(embed)
        }
    }
}