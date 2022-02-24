const { SlashCommandBuilder } = require('@discordjs/builders');
const { QueueRepeatMode } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Toggle the loop')
		.addIntegerOption(option => option.setName('mode')
			.setDescription('Sets loop mode')
			.setRequired(true)
			.addChoice("Off", QueueRepeatMode.OFF)
			.addChoice("Track", QueueRepeatMode.TRACK)
			.addChoice("Queue", QueueRepeatMode.QUEUE)
			.addChoice("Autoplay", QueueRepeatMode.AUTOPLAY)),
	async execute(interaction, player) {
		const checkRestrict = await DB.findOne({where:{name:'music'}});
		if (checkRestrict) {
			const restrictChannel = await interaction.guild.channels.fetch(checkRestrict.channel);
			if (restrictChannel != interaction.channel.id) {
				return interaction.reply({content: `❌ | The music commands are restricted to the ${restrictChannel.name} channel!`, ephemeral: true})
			}
		}
		if (!interaction.member.voice.channelId) return await interaction.reply({content: '❌ | You are not in a voice channel!', ephemeral: true});
		if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({content: '❌ | You are not in my voice channel!', ephemeral: true});
		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing) return void interaction.reply("❌ | No music is being played!");
		const loopMode = interaction.options.get("mode").value;
		const success = queue.setRepeatMode(loopMode);
		const mode = loopMode === QueueRepeatMode.TRACK ? "🔂" : loopMode === QueueRepeatMode.QUEUE ? "🔁" : "▶";
		return void interaction.reply({ content: success ? `${mode} | Updated loop mode!` : "❌ | Could not update loop mode!"});
	},
};