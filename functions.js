const dialogflow = require("@google-cloud/dialogflow");
const fs = require("fs");
const set = require("./settings.json");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { Collection, MessageEmbed } = require("discord.js");

module.exports = {
    Command: function (client, message, functions, set) {
        client.commands = new Collection();
        const commandFiles = fs
            .readdirSync("./commands")
            .filter((file) => file.endsWith(".js"));
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            client.commands.set(command.name, command);
        }
        const args = message.content
            .slice(set[client.user.username].prefix.length)
            .split(/ +/);
        const command = args.shift().toLowerCase();
        if (!client.commands.has(command)) return;
        try {
            if (command !== "") {
                client.commands
                    .get(command)
                    .execute(client, message, functions, args, set, MessageEmbed);
            }
        } catch (error) {
            console.error(error);
        }
    },
    DialogflowIntents: function (client, message, functions, set) {
        client.dialogues = new Collection();
        const dialogflowFiles = fs
            .readdirSync("./dialogflow")
            .filter((file) => file.endsWith(".js"));
        for (const file of dialogflowFiles) {
            const dialog = require(`./dialogflow/${file}`);
            client.dialogues.set(dialog.name, dialog);
        }
        if (!client.dialogues.has(client.user.username)) return;
        try {
            client.dialogues
                .get(client.user.username)
                .execute(client, message, functions, set, MessageEmbed);
        } catch (error) {
            console.error(error);
        }
    },

    DialogflowQuery: async function (client, message) {
        const config = {
            credentials: {
                private_key: process.env[
                    `PRIVATE_KEY_${client.user.username.toUpperCase()}`
                ].replace(/\\n/g, "\n"),
                client_email:
                    process.env[`CLIENT_EMAIL_${client.user.username.toUpperCase()}`],
            },
        };
        const sessionClient = new dialogflow.SessionsClient(config);
        const sessionPath = sessionClient.projectAgentSessionPath(
            process.env[`PROJECT_ID_${client.user.username.toUpperCase()}`],
            message.author.id.substring(0, 11)
        );
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: message.cleanContent,
                    languageCode: "en-US",
                },
            },
        };
        const result = await sessionClient.detectIntent(request);
        const intent = result[0].queryResult.intent.displayName;
        const response = result[0].queryResult.fulfillmentText;
        return { result, intent, response };
    },
    EmbedBuilder: function (embed) {
        try {
            const newEmbed = new MessageEmbed();
        
            if (embed[0].Color) {
                newEmbed.setColor(embed[0].Color);
            }
            if (embed[0].Title !== "undefined") {
                newEmbed.setTitle(embed[0].Title);
            }
            if (embed[0].URL !== "undefined") {
                newEmbed.setURL(embed[0].URL);
            }
            if (embed[0].Author_Text !== "undefined") {
                newEmbed.setAuthor({name:
                    embed[0].Author_Text, 
                    iconURL:embed[0].Author_Avatar_Link, 
                    url: embed[0].Author_URL
            });
            }
            if (embed[0].Description !== "undefined") {
                newEmbed.setDescription(embed[0].Description);
            }
            if (embed[0].Thumbnail !== "undefined") {
                newEmbed.setThumbnail(embed[0].Thumbnail);
            }
            if (embed[0].Image !== "undefined") {
                newEmbed.setImage(embed[0].Image);
            }
            if (embed[0].Image !== "undefined") {
                newEmbed.setImage(embed[0].Image);
            }
            if (embed[0].Footer_Avatar_URL !== "undefined" && embed[0].Footer_Text) {
                newEmbed.setFooter(embed[0].Footer_Text, embed[0].Footer_Avatar_URL);
            }
            if (embed[0].Field_1_Title && embed[0].Field_1_Text) {
                newEmbed.addField(embed[0].Field_1_Title, embed[0].Field_1_Text, embed[0].Field_1_Inline);
            }
            if (embed[0].Field_2_Title && embed[0].Field_2_Text) {
                newEmbed.addField(embed[0].Field_2_Title, embed[0].Field_2_Text, embed[0].Field_2_Inline);
            }
            if (embed[0].Field_3_Title && embed[0].Field_3_Text) {
                newEmbed.addField(embed[0].Field_3_Title, embed[0].Field_3_Text, embed[0].Field_3_Inline);
            }
            if (embed[0].Field_4_Title && embed[0].Field_4_Text) {
                newEmbed.addField(embed[0].Field_4_Title, embed[0].Field_4_Text, embed[0].Field_4_Inline);
            }
            if (embed[0].Field_5_Title && embed[0].Field_5_Text) {
                newEmbed.addField(embed[0].Field_5_Title, embed[0].Field_5_Text, embed[0].Field_5_Inline);
            }
            return newEmbed;
        } catch (e) {
            console.log(`Looks like there is a problem with some spreadsheet data!`)
        }
    },
    LogTimeout: async function (client, oldMember, newMember) {
        try{

        if (oldMember.isCommunicationDisabled() != newMember.isCommunicationDisabled()) {

            const fetchedLogs = await client.guilds.cache
                .get(set[client.user.username].guildId)
                .fetchAuditLogs({
                    limit: 1,
                    type: "MEMBER_UPDATE",
                });

            const log = fetchedLogs.entries.first();
            if (!log) return;
            console.log(log.target.tag)
            console.log(log.executor.tag)

            var timeDifference = newMember.communicationDisabledUntilTimestamp - new Date().getTime() 
            var differenceDate = new Date(timeDifference);
            var diffDays = differenceDate / (1000 * 3600 * 24);
            var diffMinutes = differenceDate.getUTCMinutes() + 1;

            const embed = new MessageEmbed()
                .setColor("#878787");

            if (newMember.communicationDisabledUntilTimestamp != undefined) {
                if (diffDays < 0.8) { embed.setDescription(`🔇${diffMinutes} minute timout for ${newMember.user.tag} (ID <@${newMember.user.id}> ) by ${log.executor.tag}`) };
                if (diffDays > 0.99 && diffDays < 5) { embed.setDescription(`🔇1 day timeout for ${newMember.user.tag} (ID <@${newMember.user.id}> by ${log.executor.tag}`) }
                if (diffDays > 5) { embed.setDescription(`🔇1 week timeout for ${newMember.user.tag} (ID <@${newMember.user.id}> by ${log.executor.tag}`) };
            } else {
                embed.setDescription(`🔊 Timeout for ${newMember.user.tag} (ID <@${newMember.user.id}> is over`)
            }

            if (log.reason != null) { embed.addField("Reason:", log.reason, false) }

            client.guilds.cache
                .get(set[client.user.username].guildId)
                .channels.cache.get(set[client.user.username].logChannel)
                .send({ embeds: [embed] });
        }
    }
    catch(e){

        console.log("I could not handle this timeout!")
    }
    },
    SpreadsheetGET: async function (client) {
        const doc = new GoogleSpreadsheet(set[client.user.username].spreadsheetID);
        await doc.useServiceAccountAuth({
            client_email:
                process.env[`CLIENT_EMAIL_${client.user.username.toUpperCase()}`],
            private_key: process.env[
                `PRIVATE_KEY_${client.user.username.toUpperCase()}`
            ].replace(/\\n/g, "\n"),
        });
        await doc.loadInfo();
        return { doc };
    },
    SpreadsheetPOST: async function (client, tab, rowData) {
        const doc = new GoogleSpreadsheet(set[client.user.username].spreadsheetID);
        await doc.useServiceAccountAuth({
            client_email:
                process.env[`CLIENT_EMAIL_${client.user.username.toUpperCase()}`],
            private_key: process.env[
                `PRIVATE_KEY_${client.user.username.toUpperCase()}`
            ].replace(/\\n/g, "\n"),
        });
        await doc.loadInfo();
    },
};
