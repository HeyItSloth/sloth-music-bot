const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');
const { token } = require('./config.json');
const { Player } = require('discord-player');
const { Sequelize, DataTypes } = require('sequelize');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const player = new Player(client);

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

const sequelize = new Sequelize('database','user','password', {
	host:		'localhost',
	dialect:	'sqlite',
	logging:	false,
	storage:	'database.sqlite'
});

const Restrict = sequelize.define('restrict', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	channel: Sequelize.STRING,
});

client.once('ready', () => {
	console.log('Ready!');

	try {
		sequelize.authenticate();
		console.log('>> DATABASE INITIALIZED, CONNECTED');
	} catch (error) {
		console.error('>> UNABLE TO CONNECT: ', error)
	};

	Restrict.sync({ force: false });
});

player.on('trackStart', (queue, track) => {
	queue.metadata.send(`▶ | Started Playing: **${track.title}**.`);
});

player.on('trackAdd', (queue, track) => {
	queue.metadata.send(`✅ | Added **${track.title}** to the queue!`);
});

player.on('botDisconnect', (queue) => {
	queue.metadata.send('I was manually disconnected from the channel, clearing queue');
});

player.on('channelEmpty', (queue) => {
	queue.metadata.send('Channel is empty, disconnecting...');
});

player.on('queueEnd', (queue) => {
	queue.metadata.send('Queue finished!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction, player, Restrict);
	} catch (error) {
		console.error(error);
		await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true });
	};
});

client.login(token);
