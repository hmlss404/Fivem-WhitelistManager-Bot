const botconfig = require("./botconfig.json");
const token = require("./token.json")
const discord = require("discord.js");
const client = new discord.Client({disableEveryone: true});
const fs = require("fs");
client.commands = new discord.Collection();

var mysql = require('mysql');

var con  = mysql.createConnection({
  connectionLimit: 20,
  host: botconfig.hostSQL,
  user: botconfig.userSQL,
  password: botconfig.passwordSQL,
  port: botconfig.portSQL,
  database: botconfig.databaseSQL
});

client.on("ready", async () => {
  console.log(`${client.user.username} się odpalił!\n`)
  client.user.setActivity("!help");
});

fs.readdir("./commands/", (err, files) => {

  if(err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js")
  if(jsfile.length <= 0){
    console.log("Nie znalazłem żadnych komend.");
    return;
  }

  jsfile.forEach((f, i) =>{
    let props = require(`./commands/${f}`);
    console.log(`Załadowano komende: ${f}!`);
    client.commands.set(props.help.name, props);
  });
  
});

client.on("messageReactionAdd", (reaction, user) => {
  let reactmsgArray = reaction.message.content.split(" ")
  var reactChar = /^[0-9a-zA-Z]+$/;
  var whitelistChat = reaction.message.channel.name
  var whitelisterUser = reaction.message.guild.member(user.id)

  if (whitelistChat === botconfig.hexIDText) {
    if (whitelisterUser.hasPermission("ADMINISTRATOR")){ 
      if (reaction.emoji.name === "✅") {
        if (reactmsgArray[0].length === 15){
          if (reactmsgArray[0].match(reactChar)){
            pool.getConnection(function(err, connection) {
              if(err) throw err;
              connection.query("SELECT * FROM user_whitelist WHERE (identifier) = (?)", "steam:" + [reactmsgArray[0]], function (err, result) { 
                if (err) throw err;
                var person = JSON.stringify(result);
                obj = JSON.parse(person);
                if (person.length > 5){
                  if (obj[0].whitelisted === 0){
                    pool.getConnection(function(err, connection) {
                      if(err) throw err;
                      connection.query("UPDATE user_whitelist SET whitelisted = '1' WHERE identifier = ?", "steam:" + [reactmsgArray[0]], function (err, result) {
                        console.log("Do whitelisty został dodany " + `<@${user.tag}>\n`)
                        user.send("HEX **" + obj[0].identifier + "**" + " został dodany do whitelisty!")
                        connection.release()
                      });
                    });
                  } else {
                    if (obj[0].whitelisted === 1){
                      user.send("**" + obj[0].identifier + "**" + " ma już whiteliste!")
                    };
                  };
                } else {
                  pool.getConnection(function(err, connection) {
                    if(err) throw err;
                    connection.query("INSERT INTO user_whitelist (identifier, whitelisted) VALUES (?, 1)", "steam:" + [reactmsgArray[0]], function (err, result) {
                      if(err) throw err;
                      console.log("Do whitelisty został dodany: " + `<@${user.tag}>`);
                      user.send("HEX **" + "steam:" + reactmsgArray[0] + "**" + " został dodany do whitelisty!");
                      connection.release();
                    });

                  });
                }
                connection.release();
              });
            });  
          } else {
            reaction.remove(user);
            user.send("Podałeś nieprawidłowy HEX")
          };
        } else {
          reaction.remove(user);
          user.send("Podany HEX jest za krótki");
        };
      } else {
        reaction.remove(user);
        user.send("Możesz zareagować jedynie ✅ aby dodać go do whitelisty!");
      };
    } else {
      reaction.remove(user);
      user.send("Nie masz permisji aby dodać go do whitelisty!");
    }
  };
  
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;
  
  let prefix = botconfig.prefix;
  let messageArray = message.content.split(" ");
  let command = messageArray[0];
  let args = messageArray.slice(1);
  var validChar = /^[0-9a-zA-Z]+$/;

  let commandfile = client.commands.get(command.slice(prefix.length));
  if (commandfile) commandfile.run(client,message,args);

  if (message.channel.name === botconfig.hexIDText){
    if (message.member.roles.has(botconfig.whitelistHelper)){
      if (messageArray[0].length === 15){
        if (messageArray[0].match(validChar)){

        } else { // testowałem te 4
          message.member.send("Podałeś nieprawidłowy HEX");
          message.delete();
        }
      } else {
        message.member.send("Podałeś nieprawidłowy HEX");
        message.delete();
      }
    } else {
      if (message.member.hasPermission("ADMINISTRATOR")){
		if (messageArray[0].length === 15){
			if (messageArray[0].match(validChar)){
				
			} else {
				message.member.send("Podałeś nieprawidłowy HEX");
				message.delete();
			};
		} else {
			message.member.send("Podałeś nieprawidłowy HEX");
			message.delete();
		};
		  
	  } else {
		message.member.send("Nie masz permisji aby dodać go do whitelisty!");
		message.delete();
	  };
    };
  };


  if (messageArray[0] === `${prefix}whitelist`){
    if (message.channel.name === botconfig.whitelistCommandChat){
      if (message.member.hasPermission("ADMINISTRATOR")){
        if (messageArray[1].slice(0, 6) === "steam:"){
          if (messageArray[1].length == 21){
            if((messageArray[1].slice(6, 21).match(validChar))){
              if(messageArray[2] === "1"){
                pool.getConnection(function(err, connection) {
                  if(err) throw err;
                  connection.query("SELECT * FROM user_whitelist WHERE (identifier) = (?)", [messageArray[1]], function (err, result) {
                    if(err) throw err;
                    var tOnWhite = JSON.stringify(result);
                    wOnData = JSON.parse(tOnWhite);
                    connection.release()
                    if (tOnWhite.length > 5){
                      if (wOnData[0].whitelisted === 0){
                        pool.getConnection(function(err, connection) {
                          if (err) throw err;
                          connection.query("UPDATE user_whitelist SET whitelisted = '1' WHERE identifier = ?", [messageArray[1]], function (err, result) {
                            if (err) throw err;
                            message.channel.send("**" + wOnData[0].identifier + "**" + " został dodany do whitelisty przez " + `<@${message.author.id}>`);
                            console.log(wOnData);
                            console.log("Został dodany do whitelisty przez" + `<@${message.member.user.tag}> \n`);
                            connection.release()
                          });
                        });
                      } else {
                        message.channel.send("**" + wOnData[0].identifier + "**" + " ma już whiteliste");
                      };
                    } else { console.log("test")
                    pool.getConnection(function(err, connection) {
                      if (err) throw err;
                      connection.query("INSERT INTO user_whitelist (identifier, whitelisted) VALUES (?, 1)", [messageArray[1]], function (err, result) {
                        if (err) throw err;
                        connection.release();
                        pool.getConnection(function(err, connection) {
                          if (err) throw err;
                          connection.query("SELECT * FROM user_whitelist WHERE (identifier) = (?)", [messageArray[1]], function (err, result) {
                            if (err) throw err;
                            var newW = JSON.stringify(result)
                            newWData = JSON.parse(newW)
                            message.channel.send("**" + newWData[0].identifier + "**" + " został dodany do whitelisty przez " + `<@${message.author.id}>`)
                            console.log(newWData)
                            console.log("Został dodany do whitelisty przez " + `<@${message.member.user.tag}> \n`)
							connection.release()
                          });
                        });
                      });
                    });
                  }
                  });
                });
              } else {
                if (messageArray[2] === "0"){
                  pool.getConnection(function(err, connection) {
                    if(err) throw err;
                    connection.query("SELECT * FROM user_whitelist WHERE (identifier) = (?)", [messageArray[1]], function (err, result) {
                      if(err) throw err;
                      var tOffWhite = JSON.stringify(result);
                      wOffData = JSON.parse(tOffWhite);
                      if (tOffWhite.length > 5){
                        if (wOffData[0].whitelisted === 1){
                          console.log(wOffData);
                          console.log("Został usunięty z whitelisty przez " + `<@${message.member.user.tag}> \n`);
                          message.channel.send("**" + wOffData[0].identifier + "**" + " został usunięty z whitelisty przez " + `<@${message.author.id}>`);
                          pool.getConnection(function(err, connection) {
                            connection.query("UPDATE user_whitelist SET whitelisted = '0' WHERE identifier = ?", [messageArray[1]], function (err, result) {
                              if (err) throw err;
                              connection.release();
                            });
                          });
                        } else {
                          message.channel.send("**" + messageArray[1] + "**" + " został wyrzucony z whitelisty!")
                        }
                      };
					connection.release()
                    });
                  });
                } else {
                  message.channel.send(new discord.MessageEmbed()
                  .setTitle("Błąd!")
                  .setColor("PURPLE")
                  .setDescription("Poprawny format: !whitelist steam:123456789012345 <0/1>, 0 = Wyrzucenie gracza z whitelisty, 1 = Dodanie gracza do whitelisty!"));
                };
              };
            };
          } else {
            message.channel.send(new discord.MessageEmbed()
            .setTitle("HEX jest za długi lub za krótki! Powinien mieć 15 znaków po `steam:`!"));
          }
        } else {
          message.channel.send(new discord.MessageEmbed()
          .setTitle("Błąd!")
          .setColor("PURPLE")
          .setDescription("Poprawny format: !whitelist steam:123456789012345 <0/1>, 0 = Wyrzucenie gracza z whitelisty, 1 = Dodanie gracza do whitelisty!"));
        }
      };
    };
  };
  
});


client.login(token.token);
