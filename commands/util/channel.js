const { SlashCommandBuilder } = require('@discordjs/builders');
const { Sequelize } = require('sequelize')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Set the channel for certain commands')
		.addSubcommand(subcommand => subcommand
			.setName('set')
			.setDescription('Set the restrictions of channel')
			.addStringOption(option => option.setName('type')
				.setDescription('What you are restricting')
				.setRequired(true)
				.addChoice('Music', 'music')
				.addChoice('Moderation', 'mod'))
			.addChannelOption(option => option.setName('channel')
				.setDescription('Which channel you are restricting to')
				.setRequired(true)))
		.addSubcommand(subcommand => subcommand
				.setName('check')
				.setDescription('Check the restrictions of a type')
				.addStringOption(option => option.setName('type')
					.setDescription('What you are restricting')
					.setRequired(true)
					.addChoice('Music', 'music')
					.addChoice('Moderation', 'mod'))),
    async execute(interaction, _, DB) {
		const mode = interaction.options.getSubcommand()
		if (mode === 'set') {
			const type = interaction.options.get('type').value;
			const chan = interaction.options.get('channel').value;
			console.log(type)
			console.log(chan)

			try {
				const restrict = await DB.create({
					name: type,
					channel: chan
				});
				const guildChannel = await interaction.guild.channels.fetch(chan);
				interaction.reply(`Updated restrictions of type "${type}", set to channel: ${guildChannel.name}`)
			} catch (e) {
				if (e.name === "SequelizeUniqueConstraintError") {
					const guildChannel = await interaction.guild.channels.fetch(chan);
					const update = await DB.update({channel: chan}, {where: {name: type}});
					return interaction.reply(`Updated module "${type}" to channel \`${guildChannel.name}\``)
				}
				return interaction.reply('Something went wrong...')
			};
		} else if (mode === 'check') {
			const type = interaction.options.get('type').value;
			const find = await DB.findOne({where:{name:type}});
			const channel = await interaction.guild.channels.fetch(find.channel);
			return interaction.reply(`The "${type}" module is restricted to the \`${channel.name}\` channel.`)
		};
    },
};