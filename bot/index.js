require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
var botCommands = require('./commands')
const TOKEN = process.env.TOKEN;

Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key])
})
botCommands = Object.entries(botCommands)
bot.login(TOKEN);

bot.on('ready', () => {
  bot.user.setUsername("D&D Bot")
  bot.user.setActivity("D&D")
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  if (msg.channel.type === "dm") return;
  const args = msg.content.split(/ +/);
  const command = args.shift().toLocaleLowerCase();
  console.info('Called command:' + command);

  if (!bot.commands.has(command)) {
    if (command != "?help") {
      return;
    }
    var string = "Possible commands:\n?help: This command. \n"
    for (i = 0; i < botCommands.length; i++) {
      string += botCommands[i][1].name + ": " + botCommands[i][1].description + '\n';
    }
    msg.channel.send(string)
    console.log("message sent?")
    return
  }

  try {
    bot.commands.get(command).execute(msg, args);
  } catch (error) {
    msg.reply('there was an error trying to execute that command')
  }
});
