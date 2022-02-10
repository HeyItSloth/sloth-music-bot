const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Show the queue'),
	async execute(interaction, player) {
		if (!interaction.member.voice.channelId) return await interaction.reply({content: 'You are not in a voice channel!', ephemeral: true});
		if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({content: 'You are not in my voice channel!', ephemeral: true});
		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing) return void interaction.reply('No music is currently playing...');
		const currentTrack = queue.current;
		const tracks = queue.tracks.slice(0, 10).map((m, i) => {
			return `${i + 1}. **${m.title}** ([link](${m.url}))`;
		});

		return void interaction.reply({
			embeds: [
				{
					title: "Server Queue",
					description: `${tracks.join("\n")}${
						queue.tracks.length > tracks.length
							? `\n...${queue.tracks.length - tracks.length === 1 ? `${queue.tracks.length - tracks.length} more track` : `${queue.tracks.length - tracks.length} more tracks`}`
							: ""
					}`,
					color: 0xff0000,
					fields: [{name: "Now Playing", value: `**${currentTrack.title}** ([link](${currentTrack.url}))`}]
				}
			]
		});
	},
};