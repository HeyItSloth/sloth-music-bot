const { SlashCommandBuilder } = require('@discordjs/builders');
const { QueryType } = require('discord-player');
const playdl = require("play-dl");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays the song')
		.addStringOption(option => option.setName('query').setDescription('The song').setRequired(true)),
	async execute(interaction, player) {
		if (!interaction.member.voice.channelId) return await interaction.reply({content: '❌ | You are not in a voice channel!', ephemeral: true});
		if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({content: '❌ | You are not in my voice channel!', ephemeral: true});
		const query = interaction.options.get('query').value;
		const res = await player.search(query, {
			requestedBy: interaction.user,
			searchEngine: QueryType.AUTO
		}).then(x => x.tracks[0]);

		if (!res) return await interaction.reply({content: `❌ | Track **${query}** not found!`});

		const queue = player.createQueue(interaction.guild, {
			metadata: interaction.channel,
			leaveOnEnd: false,
			leaveOnEmpty: true,
			leaveOnEmptyCooldown: 200000,
		});

		try {
			if (!queue.connection) await queue.connect(interaction.member.voice.channel);
		} catch {
			await player.deleteQueue(interaction.guild.id)
			return await interaction.reply({content: '❌ | Cound not join your voice channel!', ephemeral: true});
		}		

		if (!res.playlist) {
			await interaction.reply({ content: `⏱ | Loading track **${res.title}**!` });
		} else {
			await interaction.reply({ content: `⏱ | Loading playlist, adding **${res.playlist.tracks.length}** songs to the queue!` });
		}

		res.playlist ? queue.addTracks(res.playlist.tracks) : queue.addTrack(res.tracks[0])

		if (!queue.playing) await queue.play()
	},
};