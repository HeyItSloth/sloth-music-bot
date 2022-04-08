const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cat')
		.setDescription('Gib cat'),
	async execute(interaction) {
		const response = await fetch("https://aws.random.cat/meow");
		if (response.ok) {
			const {file} =  await response.json();
			interaction.reply({ files: [file] });
		} else {
			interaction.reply("Shit's brokey, yo");
		};
	},
};