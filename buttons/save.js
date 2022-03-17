const fs = require('fs');

module.exports = {
    data: 'save',
    async execute(interaction, player) {
        if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({content: '❌ | You are not in my voice channel!', ephemeral: true});
		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing) return void interaction.reply({content: 'No music currently playing!', ephemeral: true});
        await interaction.deferUpdate();

        const savedTracks = fs.readdirSync('./saved').filter(file => file.endsWith('.json'));

        for (const file of savedTracks) {
            if (queue.current.id === file) {
                return void interaction.channel.send({
                    content: 'This song is already in the Saved Playlist', ephemeral: true
                });
            }
        }
        fs.writeFile(`./saved/${queue.current.id}.json`, JSON.stringify(queue.current), function(err) {
            if (err) throw err;
            console.log('Saved!');
        });       
    }
};