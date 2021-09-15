require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
var botCommands = require('./commands')
const TOKEN = process.env.TOKEN;
const schedule = require("node-schedule")
const axios = require('axios')

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

  if(msg.content === "?") {
    return
  }
  if (msg.channel.type === "dm") return;
  const args = msg.content.split(/ +/);
  const command = args.shift().toLocaleLowerCase();
  if (!bot.commands.has(command)) {
    if (command != "?help") {
      if (command[0] != "?") {
        return
      }
      if (!isNaN(command[1])) {
        bot.commands.get("?roll").execute(msg, args)
      } else {
        bot.commands.get("?info").execute(msg, args)
      }
      return
    }
    var string = "Possible commands: ```\n?help: This command.\n"
    for (i = 0; i < botCommands.length; i++) {
      string += botCommands[i][1].name + ": " + botCommands[i][1].description + '\n';
    }
    string += "```"
    msg.channel.send(string)

    return
  }
  try {
    bot.commands.get(command).execute(msg, args);
  } catch (error) {
    msg.reply('there was an error trying to execute that command')
  }
});

const rule = new schedule.RecurrenceRule()
rule.hour = 9
rule.minute = 0
rule.tz = 'Europe/Amsterdam'

const job = schedule.scheduleJob(rule, async function () {
  var sessions = await axios.get(process.env.SERVER_IP + `/sessions`)
  var dndDay = Infinity;
  const nowTime = new Date().getTime()
  sessions.data.forEach(day => {
    if (nowTime < day.date) {
      if (day.date - nowTime < dndDay - nowTime) {
        dndDay = day.date;
      }
    }
  });
  if (dndDay === Infinity) {
    var channel = bot.channels.find(ch => ch.name == 'dnd-stuff')
    channel.send(`Don't forget to enter new dates on the dndbot website!`)
  } else {
    var date = new Date(dndDay)
    if (date.getDate() == new Date().getDate()) {
      var channel = bot.channels.find(ch => ch.name == 'dnd-stuff')
      channel.send(`OMG OMG OMG AAAAAAAAAAH DND IS TODAY!`)
      channel.send(`WEEEEEEEEEEEEEEEEEEEEEEEEEEEE`)
    }
  }
})