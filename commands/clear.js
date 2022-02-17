const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clears the queue'),
	async execute(interaction, player) {
		if (!interaction.member.voice.channelId) return await interaction.reply({content: '❌ | You are not in a voice channel!', ephemeral: true});
		if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({content: '❌ | You are not in my voice channel!', ephemeral: true});
		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing) return void interaction.reply('❌ | No music is being played!');
		const cleared = queue.destroy(true)
		return void interaction.reply({
			content: !cleared ? "❌ | Something went wrong!" : "✅ | Queue has been cleared!"
		});
	},
};