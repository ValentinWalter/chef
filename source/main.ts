import { Client } from "discord.js"
import { sendMenu, getCheck, order } from "./menu"
import { play, leave } from "./play"
import "dotenv/config"

const chef = new Client()
const token = process.env.DISCORD_CHEF_CLIENT_ID
const prefix = "?"

chef.on("ready", () => {
    console.log("Ready!")
})

chef.on("message", message => {
    if (message.content[0] != prefix) return

    let args = message.content
        .substring(prefix.length)
        .toLowerCase()
        .split(" ")

    switch (args[0]) {
        case "play":
            play(args[1], message)
            break
        case "leave":
            leave(message)
            break
        case "rechnung":
            getCheck(message)
            break
        case "speisekarte":
            sendMenu(message)
            break
        case "bestell":
            // combine all arguments
            let item = args.slice(1, args.length).join(" ")
            order(item, message)
            break
        default:
            break
    }
})

chef.login(token)
    .catch(error => {
        console.error(`discord.js: ${error.message}`)
    })