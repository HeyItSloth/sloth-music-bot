const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pauses the current song.'),
	async execute(interaction, player) {
		if (!interaction.member.voice.channelId) return await interaction.reply({content: '❌ | You are not in a voice channel!', ephemeral: true});
		if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({content: '❌ | You are not in my voice channel!', ephemeral: true});
		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing) return void interaction.reply('❌ | No music is being played!');
		const paused = queue.setPaused(true);
		return void interaction.reply({
			content: paused ? `⏸ | Paused current track!` : '❌ | Something went wrong...'
		});
	},
};