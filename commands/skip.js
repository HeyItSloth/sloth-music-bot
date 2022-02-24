const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips the current song'),
	async execute(interaction, player) {
		const checkRestrict = await DB.findOne({where:{name:'music'}});
		if (checkRestrict) {
			const restrictChannel = await interaction.guild.channels.fetch(checkRestrict.channel);
			if (restrictChannel != interaction.channel.id) {
				return interaction.reply({content: `❌ | The music commands are restricted to the ${restrictChannel.name} channel!`, ephemeral: true})
			}
		}
		if (!interaction.member.voice.channelId) return await interaction.reply({content: '❌ | You are not in a voice channel!', ephemeral: true});
		if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({content: '❌ | You are not in my voice channel!', ephemeral: true});
		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing) return void interaction.reply('❌ | No music is being played!');
		const currentTrack = queue.current;
		const success  = queue.skip();
		return void interaction.reply({
			content: success ? `✅ | Skipped current track **${currentTrack}**!` : '❌ | Something went wrong...'
		});
	},
};