module.exports = {
  name: "u",
  async execute(client, message, functions, args, set) {
    message.delete().catch(_ => {});

    const adminRoles = set[client.user.username].adminRoles;
    if (
      message.member.roles.cache.some(r => adminRoles.includes(r.id)) ||
      message.member.hasPermission("ADMINISTRATOR")
    ) {
      const data = await functions.SpreadsheetGET(client);
      const sheet = data.doc.sheetsByTitle["Embeds"];
      const rows = await sheet.getRows();

      let embed = rows.filter(row => row.name == args[2]);
      const finalEmbed = functions.EmbedBuilder(embed);

      client.channels.cache
        .get(args[0])
        .messages.fetch(args[1])
        .then(msg => msg.edit({ embeds: [finalEmbed] }))
        .catch(console.error);
      console.log("Updating Embed");
    }}}
    
    
