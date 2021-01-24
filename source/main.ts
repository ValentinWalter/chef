import * as dotenv from "dotenv"
dotenv.config()

import Discord from "discord.js"
import * as Menu from "./menu"
import * as Voice from "./voice"
import * as Casino from "./casino"
import * as Stupidshit from "./stupidshit"

export const chef = new Discord.Client()
export const token = process.env.DISCORD_CHEF_CLIENT_ID
export const prefix = "?"

export var users = new Map<string, User>()
class User {
    balance: number
    constructor(balance: number = 100) {
        this.balance = balance
    }
}

chef.once("ready", () => {
    console.log("Ready!")
    chef.user?.setPresence({ activity: { name: "mit schulzi" }, status: "online" })
})

chef.on("message", async message => {
    // stupidshit
    if (message.author.id == "769275223747854376" && message.attachments.size == 0) {
        // Leonard
        let attachment = await Stupidshit.createImageWithText(message.content)
        message.delete()
        message.channel.send(attachment)
        return
    } else if (message.author.id == "338408417645428736") {
        // Bonez
        let attachment = await Stupidshit.cracker()
        message.channel.send(attachment)
        return
    }

    if (!message.content.startsWith(prefix)) {
        // addToBalance(Math.floor(Math.random() * 10), message.author.id)
        return
    }

    let args = message.content
        .substring(prefix.length)
        .toLowerCase()
        .split(" ")

    switch (args[0]) {
        case "ping":
            message.channel.send("pong")
            break
        case "status":
            let embed = new Discord.MessageEmbed()
                .setTitle(`Process ${process.pid}`)
                .addField("Platform", process.platform)
                .addField("Memory Usage", process.memoryUsage().heapUsed, true)
                .addField("Memory Total", process.memoryUsage().heapTotal, true)
                // .addField("Resource Usage", process.resourceUsage().)
                .addField("CPU Usage", process.cpuUsage().user)
            message.channel.send(embed)
            break
        case "play":
            Voice.play(args[1], message)
            break
        case "leave":
            Voice.leave(message)
            break
        case "rechnung":
            Menu.getCheck(message)
            break
        case "speisekarte":
            Menu.sendMenu(message)
            break
        case "bestell":
            // combine all arguments
            let item = args.slice(1, args.length).join(" ")
            Menu.order(item, message)
            break
        case "gulden":
            // let balance = getBalance(message.author.id)
            // let embed = new Discord.MessageEmbed()
            //     .setTitle(`${balance.toFixed(2)}€`)
            //     .setColor(0x00FFFF)
            //     .setDescription(`Des ${message.member.nickname}s Geldsack.`)
            // // .setThumbnail(message.author.avatarURL())
            // message.channel.send(embed)
            break
        case "coinflip":
            Casino.coinflip(Math.round(Number(args[1])), message)
            break
        case "cf":
            Casino.coinflip(Math.round(Number(args[1])), message)
            break
        default:
            break
    }
})

chef.on("voiceStateUpdate", (previousState, updatedState) => {
    // let userID = previousState.member.user.id
    // if (!previousState.channel && updatedState.channel) {
    //     addToBalance(Math.floor(Math.random() * 100), userID)
    // }

    // function addAmountEvery(amount: number, interval: number) {
    //     after(interval)
    //     .then()
    // }
})

// function after(seconds: number) {
//     return new Promise(r => {
//         setTimeout(r, seconds);
//     })
// }

chef.login(token)
    .catch(error => {
        console.error(`discord.js: ${error.message}`)
    })

process.on("SIGINT", async () => {
    await chef.user?.setPresence({ activity: { name: "under maintenance" }, status: "dnd" })
    process.exit(0)
})