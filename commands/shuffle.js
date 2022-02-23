const { SlashCommandBuilder } = require('@discordjs/builders');
const { Queue } = require('discord-player')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the queue')
        .addIntegerOption(option => option.setName('toggle')
            .setDescription('Toggle shuffle of the queue.')
            .setRequired(true)
            .addChoice("Off", 1)
            .addChoice("On", 2)),
    async execute(interaction, player) {
		if (!interaction.member.voice.channelId) return await interaction.reply({content: '❌ | You are not in a voice channel!', ephemeral: true});
		if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({content: '❌ | You are not in my voice channel!', ephemeral: true});
        const queue = player.getQueue(interaction.guildId);
        if (!queue || !queue.playing) return void interaction.reply('❌ | No music is being played!');
        const shuffle = interaction.options.get('toggle').value;
        if (shuffle == 1) {
            queue.shuffle(false)
            return void interaction.reply('Queue shuffled!')
        } else {
            queue.shuffle(true)
            return void interaction.reply('Queue unshuffled!')
        }
    }
}