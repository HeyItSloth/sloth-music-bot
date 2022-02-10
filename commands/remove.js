const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Remove a song from the queue')
		.addIntegerOption(option => option.setName('track').setDescription('The position of the song in the queue').setRequired(true)),
	async execute(interaction, player) {
		if (!interaction.member.voice.channelId) return await interaction.reply({content: '❌ | You are not in a voice channel!', ephemeral: true});
		if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({content: '❌ | You are not in my voice channel!', ephemeral: true});
		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing) return void interaction.reply('❌ | No music is currently playing...');
		const queueId = interaction.options.get('track').value;
		const song = queue.tracks[queueId-1]
		const success = queue.remove(song)

		return void interaction.reply({
			content: success ? `✅ | Removed track **${song.title}** from the queue!` : '❌ | Something went wrong...'
		});
	},
};