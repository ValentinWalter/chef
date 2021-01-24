import * as Discord from "discord.js"
import * as Canvas from "canvas"

export async function createImageWithText(text: string) {
    const canvas = Canvas.createCanvas(800, 446)
    const ctx = canvas.getContext('2d')

    const background = await Canvas.loadImage('resources/backdrop.png')
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

    // Select the font size and type from one of the natively available fonts
    ctx.font = '700 50px sans-serif'
    ctx.textBaseline = 'middle'
    ctx.textAlign = "center"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
    // Select the style that will be used to fill the text in
    ctx.fillStyle = '#ffffff'
    // Actually fill the text with a solid color
    let lines = wrap(text, 780, ctx)
    let wrapped = lines.join("\n")
    let metrics = ctx.measureText(wrapped);
    let fontHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    ctx.fillText(wrapped, canvas.width / 2, (canvas.height - fontHeight) / 2)
    ctx.strokeText(wrapped, canvas.width / 2, (canvas.height - fontHeight) / 2)

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'leonard.png')

    return attachment
}

export async function cracker() {
    const canvas = Canvas.createCanvas(800, 446)
    const ctx = canvas.getContext('2d')

    const background = await Canvas.loadImage('resources/cracker.png')
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'bonez.png')

    return attachment
}

function wrap(text: string, maxWidth: number, ctx: Canvas.CanvasRenderingContext2D) {
    var words = text.split(" ")
    var lines = []
    var currentLine = words[0]

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width
        if (width < maxWidth) {
            currentLine += " " + word
        } else {
            lines.push(currentLine)
            currentLine = word
        }
    }
    lines.push(currentLine)
    return lines
}