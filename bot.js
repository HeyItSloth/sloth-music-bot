const fs = require('fs');
const { Client, Intents, Collection, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { token } = require('./config.json');
const { Player } = require('discord-player');
const { Sequelize, DataTypes } = require('sequelize');
const { getVoiceConnection } = require('@discordjs/voice');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const player = new Player(client);
let paused;

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.buttons = new Collection();
const buttonFiles = fs.readdirSync(`./buttons`).filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
	const button = require(`./buttons/${file}`);
	client.buttons.set(button.data, button);
}

let tracks = new Array()
function LoadSaved() {
	tracks = []
	if (!fs.existsSync('./saved')) {
		fs.mkdirSync('./saved');
	};
	const savedTracks = fs.readdirSync('./saved').filter(file => file.endsWith('.json'));
	for (const file of savedTracks) {
		fs.readFile(`./saved/${file}`, function(err, data) {
			const track = JSON.parse(data);
			tracks.push(track);
		});
	};
};

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

	client.user.setActivity({
        name: "🎶 | Music Time",
        type: "LISTENING"
    });

	LoadSaved();

	try {
		sequelize.authenticate();
		console.log('>> DATABASE INITIALIZED, CONNECTED');
	} catch (error) {
		console.error('>> UNABLE TO CONNECT: ', error)
	};

	Restrict.sync({ force: false });
});


player.on('trackStart', (queue, track) => {
	const nowplay = new MessageEmbed()
		.setTitle(`Now Playing: ${track.title}`)
		.setURL(track.url)
		.setDescription(`▬▬▬▬▬▬▬▬▬▬▬▬▬▬ 00:00/${track.duration}`)
		.setColor('#0000ff')
		.addFields(
			{ name: 'Requested By', value: track.requestedBy.tag, inline: true },
			{ name: 'Artist', value: track.author, inline: true }
		)
		.setTimestamp()
	const row1 = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('restart')
					.setLabel(' ')
					.setStyle('SECONDARY')
					.setEmoji('⏮️')
			)
			.addComponents(
				new MessageButton()
					.setCustomId('pauseplay')
					.setLabel(' ')
					.setStyle('SECONDARY')
					.setEmoji('⏯️')
			)
			.addComponents(
				new MessageButton()
					.setCustomId('skip')
					.setLabel(' ')
					.setStyle('SECONDARY')
					.setEmoji('⏭️')
			);
	const row2 = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('save')
					.setLabel('')
					.setStyle('SECONDARY')
					.setEmoji('❤️')
			)
			.addComponents(
				new MessageButton()
					.setCustomId('stop')
					.setLabel('')
					.setStyle('SECONDARY')
					.setEmoji('⏹️')
			);
	queue.metadata.send({ embeds: [nowplay], components: [row1, row2] });
});

player.on('trackAdd', (queue, track) => {
	queue.metadata.send(`✅ | Added **${track.title}** to the queue!`);
});

player.on('botDisconnect', (queue) => {
	console.log('>> Disconnected')
	queue.metadata.send('I was manually disconnected from the channel, clearing queue');
	queue.destroy();
});

player.on('channelEmpty', (queue) => {
	queue.metadata.send('Channel is empty, disconnecting...');
	const connection = getVoiceConnection(queue.guild.me.voice.channelId)
	connection.destroy();
	queue.destroy();
});

player.on('queueEnd', (queue) => {
	queue.metadata.send('Queue finished!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	if (interaction.commandName === 'saved') {LoadSaved()};

	try {
		await command.execute(interaction, player, Restrict, tracks);
	} catch (error) {
		console.error(error);
		await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true });
	};
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;

	const button = client.buttons.get(interaction.customId);

	if (!button) return;

	try {
		if (interaction.customId == 'pauseplay') {
			paused = await button.execute(interaction, player, paused);
		} else {
			await button.execute(interaction, player);
		}
	} catch (error) {
		console.error(error);
	};
});

client.login(token);
