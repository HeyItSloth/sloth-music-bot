module.exports = {
	data: 'stop',
	async execute(interaction, player) {
		if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({content: '❌ | You are not in my voice channel!', ephemeral: true});
		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing) return void interaction.reply({content: 'No music currently playing!', ephemeral: true});
		const cleared = queue.destroy();
		await interaction.deferUpdate();
		return void interaction.channel.send({
			content: cleared ? "❌ | Something went wrong!" : "✅ | Queue has been stopped!"
		});
	},
};