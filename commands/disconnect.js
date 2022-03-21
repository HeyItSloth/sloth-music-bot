const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnects the bot and kills the queue'),
    async execute(interaction, player, DB) {
        const checkRestrict = await DB.findOne({where:{name:'music'}});
		if (checkRestrict) {
			const restrictChannel = await interaction.guild.channels.fetch(checkRestrict.channel);
			if (restrictChannel != interaction.channel.id) {
				return interaction.reply({content: `❌ | The music commands are restricted to the ${restrictChannel.name} channel!`, ephemeral: true})
			}
		}

        const queue = player.getQueue(interaction.guildId);
        const success = queue.destroy();
        return void interaction.reply({
            content: !success ? `✅ | Successfully disconnected!` : '❌ | Something went wrong...'
        });   
    }
};