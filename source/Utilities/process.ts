import Discord from "discord.js"

export default class ProcessUtility {
	/**
     * Get a Discord.MessageEmbed displaying relevant process info.
     */
	public embed() {
		return new Discord.MessageEmbed()
			.setTitle(`${process.title} ${process.pid}`)
			.addField("Platform", process.platform)
			.addField("Memory Usage", process.memoryUsage().heapUsed, true)
			.addField("Memory Total", process.memoryUsage().heapTotal, true)
		// .addField("Resource Usage", process.resourceUsage().)
			.addField("CPU Usage", process.cpuUsage().user)
	}
}