console.log("NodeJS Version: " + process.version);
const express = require("express")
const app = express()
app.get("/", (request, response) => {
    response.sendStatus(200)
})
app.listen()

const { Client, Intents, MessageEmbed } = require('discord.js');
const ReactionsAdd = require("./reactionsAdd.js")
const ReactionsRemove = require("./reactionsRemove.js")
const set = require("./settings.json")
const functions = require("./functions.js")
const schedule = require("node-schedule")

const BotTokens = [process.env.BOT_AVREL]

BotTokens.forEach(runBot)

function runBot(token) {
    const client = new Client({
        partials: ["MESSAGE", "CHANNEL", "REACTION", "USER"],
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
        clientOptions: {
            fetchAllMembers: true
        }
    })

    client.on("error", error => console.log(error))
    process.on("error", error => console.log(error))
    process.on("uncaughtException", error => console.log(error))
    process.on("unhandledRejection", error => console.log(error))

    // READY UP =====================================
    client.once("ready", () => {
        client.user.setPresence({
            status: set[client.user.username].status,
            activities: [{
                name: set[client.user.username].activity.name,
                url: set[client.user.username].activity.url,
                type: set[client.user.username].activity.type
            }]
        })
        console.log(client.user.username + " Ready!")
    })
    client.login(token)

    // TIMEOUT LOG =====================================

     client.on("guildMemberUpdate", async (oldMember, newMember) => { if(set[client.user.username].logTimeout == true){ functions.LogTimeout(client, oldMember, newMember) }});

     // MESSAGE =====================================
    client.on("messageCreate", async message => {
        if ((client.user.id != message.author.id && !message.author.bot) &&
            !(message.content.includes("@here") || message.content.includes("@everyone"))) {
            if (message.content.startsWith(set[client.user.username].prefix)) {
                functions.Command(client, message, functions, set, MessageEmbed)
            }
            else if (message.cleanContent.length < 255) {

                //@Drago here...
                functions.DialogflowIntents(client, message, functions, set)
            }
        }
    })
}