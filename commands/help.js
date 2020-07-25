const discord = require("discord.js")

module.exports.run = (client, message, args) => {
    let pic = client.user.displayAvatarURL;
    const embed = {
      Color: "#000000",
      title: "WhitelistManager",
      description: "Automatyczne dodawanie osób do whitelisty",
      thumbnail: {
        url: pic,
      },
      fields: [
        {
          name: "\u200b",
          value: "\u200b",
        },
        {
          name: "$whitelist <HEXID> <0>",
          value: "Usuwa gracza z whitelisty na serwerze",
        },
        {
          name: "$whitelist <HEXID> <1>",
          value: "Dodaje gracza do whitelisty na serwerze",
        },
      ],
      };

    message.channel.send({ embed: embed });
}

module.exports.help = {
    name: "help"
};