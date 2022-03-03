module.exports = {
	data: 'pauseplay',
	async execute(interaction, player, paused) {
		if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({content: '❌ | You are not in my voice channel!', ephemeral: true});
		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing) return void interaction.reply({content: 'No music currently playing!', ephemeral: true});
        if (paused) {
            queue.setPaused(false);
            paused = false;
        } else {
            queue.setPaused(true);
            paused = true;
        }
		await interaction.deferUpdate();
		interaction.channel.send({
			content: paused ? `⏸ | ${interaction.member} paused current track!` : !paused ? `▶️ | ${interaction.member} resumed the current track!` :  '❌ | Something went wrong...'
		});
        return paused;
	},
};