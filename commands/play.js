const { SlashCommandBuilder } = require('@discordjs/builders');
const { QueryType } = require('discord-player');
// Comment to test
module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays the song')
		.addStringOption(option => option.setName('query').setDescription('The song').setRequired(true)),
	async execute(interaction, player, DB) {
		const checkRestrict = await DB.findOne({where:{name:'music'}});
		if (checkRestrict) {
			const restrictChannel = await interaction.guild.channels.fetch(checkRestrict.channel);
			if (restrictChannel != interaction.channel.id) {
				return interaction.reply({content: `❌ | The music commands are restricted to the ${restrictChannel.name} channel!`, ephemeral: true})
			}
		}
		if (!interaction.member.voice.channelId) return await interaction.reply({content: '❌ | You are not in a voice channel!', ephemeral: true});
		if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({content: '❌ | You are not in my voice channel!', ephemeral: true});
		const query = interaction.options.get('query').value;
		let engine
		if (query.includes('spotify.com/track')) {
			engine = QueryType.SPOTIFY_SONG;
		} else if (query.includes('spotify.com/album')) {
			engine = QueryType.SPOTIFY_ALBUM;
		} else if (query.includes('spotify.com/playlist')) {
			engine = QueryType.SPOTIFY_PLAYLIST;
		} else {
			engine = QueryType.AUTO;
		}
		const res = await player.search(query, {
			requestedBy: interaction.user,
			searchEngine: engine
		}).then(x => x.tracks[0]);

		if (!res) return await interaction.reply({content: `❌ | Track **${query}** not found!`});

		const queue = player.createQueue(interaction.guild, {
			metadata: interaction.channel,
			leaveOnEnd: false,
			leaveOnEmptyCooldown: 20000,
			leaveOnEmpty: true,
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

		res.playlist ? queue.addTracks(res.playlist.tracks) : queue.addTrack(res)

		if (!queue.playing) await queue.play()
	},
};