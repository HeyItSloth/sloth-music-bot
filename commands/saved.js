const { SlashCommandBuilder } = require("@discordjs/builders");
const { QueryType } = require('discord-player');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('saved')
		.setDescription('Interact with the saved playlist')
		.addSubcommand(sub => 
			sub.setName('list')
				.setDescription('List the current saved tracks'))
		.addSubcommand(sub => 
			sub.setName('reload')
				.setDescription('Reload the saved playlist'))
		.addSubcommand(sub => 
			sub.setName('play')
				.setDescription('Adds the saved track list to the queue'))
		.addSubcommand(sub =>
			sub.setName('remove')
				.setDescription('Remove a track from the saved playlist')
				.addNumberOption(option => option.setName('track')
					.setDescription('Track to remove from the saved playlist')
					.setRequired(true))),
	async execute(interaction, player, DB, savedTracks) {
		const checkRestrict = await DB.findOne({where:{name:'music'}});
		if (checkRestrict) {
			const restrictChannel = await interaction.guild.channels.fetch(checkRestrict.channel);
			if (restrictChannel != interaction.channel.id) {
				return interaction.reply({content: `❌ | The music commands are restricted to the ${restrictChannel.name} channel!`, ephemeral: true})
			}
		}
		if (interaction.options.getSubcommand() === 'list') {
			const tracks = savedTracks.slice(0, 10).map((m, i) => {
				return `${i+1}. **${m.title}** ([link](${m.url}))`;
			});

			interaction.reply({
				embeds: [
					{
						title: "Saved Playlist",
						description: `${tracks.join("\n")}${
							""
						}`,
						color: 0xff0000
					}
				]
			})
		} else if (interaction.options.getSubcommand() === 'play') {
			if (!interaction.member.voice.channelId) return await interaction.reply({content: '❌ | You are not in a voice channel!', ephemeral: true});
			if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({content: '❌ | You are not in my voice channel!', ephemeral: true});
			let queue = player.getQueue(interaction.guildId);
			if (!queue) {
				queue = player.createQueue(interaction.guild, {
					metadata: interaction.channel,
					leaveOnEnd: false,
					leaveOnEmptyCooldown: 2000,
					leaveOnEmpty: true,
				});
			};
			for (const track of savedTracks) {
				const res = await player.search(track.url, {
					requestedBy: interaction.user,
					searchEngine: QueryType.AUTO
				}).then(x => x.tracks[0]);
				queue.addTrack(res);
				console.log(`>> ${res.title} added to queue`);
			}
			try {
				if (!queue.connection) await queue.connect(interaction.member.voice.channel);
			} catch {
				await player.deleteQueue(interaction.guild.id)
				return await interaction.reply({content: '❌ | Cound not join your voice channel!', ephemeral: true});
			}
			interaction.reply('>> Saved playlist added to queue')
			if (!queue.playing) await queue.play()
		} else if (interaction.options.getSubcommand() === 'remove') {
			const remove = interaction.options.get('track').value;
			const song = savedTracks[remove-1]
			fs.unlink(`./saved/${song.id}.json`, function(err) {
				if (err) throw err;
				console.log(`Removed song ${song.title} from saved playlist`)
			});
			return await interaction.reply(`>> Removed song **${song.title}** from the saved playlist!`);
		} else if (interaction.options.getSubcommand() === 'reload') {
			return await interaction.reply('Reloaded!')
		}
	}
}