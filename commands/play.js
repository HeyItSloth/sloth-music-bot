const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays the song')
		.addStringOption(option => option.setName('query').setDescription('The song').setRequired(true)),
	async execute(interaction, player) {
		if (!interaction.member.voice.channelId) return await interaction.reply({content: 'You are not in a voice channel!', ephemeral: true});
		if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({content: 'You are not in my voice channel!', ephemeral: true});
		const query = interaction.options.get('query').value;
		const queue = player.createQueue(interaction.guild, {
			metadata: interaction.channel,
			leaveOnEnd: false,
			leaveOnEmptyCooldown: 300000
		});

		try {
			if (!queue.connection) await queue.connect(interaction.member.voice.channel);
		} catch {
			queue.destroy();
			return await interaction.reply({content: 'Cound not join your voice channel!', ephemeral: true});
		}

		const track = await player.search(query, {
			requestedBy: interaction.user
		}).then(x => x.tracks[0]);
		if (!track) return await interaction.reply({content: `Track **${query}** not found!`});

		queue.play(track);
		return await interaction.reply({ content: `Loading track **${track.title}**!` });
	},
};