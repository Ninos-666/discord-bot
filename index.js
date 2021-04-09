const Discord = require('discord.js');
const bot = new Discord.Client();
const token = require("./token.json");
const bdd = require('./bdd.json');
const ytdl = require("ytdl-core");
const moment = require('moment') 



//PREFIX DU BOT
const prefix = "$";
//PREFIX DU BOT


var list = []; 

//BOT FONCTIONNEL ?
bot.on("ready", () => {
    console.log("Bot oppérationnel !");
});
//BOT FONCTIONNEL ?


//COMMANDE MESSAGE
bot.on("message", async message => {
    if(message.author.bot) return;
    if(message.channel.type == "dm") return;

    /*****************************************
    ************ COMMANDE HANDLER ************
    ******************************************/
    let commande = message.content.trim().split(" ")[0].slice(1)
    let args = message.content.trim().split(" ").slice(1);
    
    if (message.content.startsWith("$info")) {
        if(message.mentions.users.first()) {
            user = message.mentions.users.first();
       } else{
            user = message.author;
        }
        const member = message.guild.member(user);

        const embed = new Discord.MessageEmbed() 
        .setColor('#ff5555')
        .setThumbnail(user.avatarURL)
        .setTitle(`Information sur ${user.username}#${user.discriminator} :`)
        .addField('ID du compte:', `${user.id}`, true)
        .addField('Pseudo sur le serveur :', `${member.nickname ? member.nickname : 'Aucun'}`, true)
        .addField('A crée son compte le :', `${moment.utc(user.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`, true)
        .addField('A rejoint le serveur le :', `${moment.utc(member.joinedAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`, true)
        .addField('Status:', `${user.presence.status}`, true)
        .addField('Joue a :', `${user.presence.game ? user.presence.game.name : 'Rien'}`, true)
        .addField('Roles :', member.roles.cache.map(roles => `${roles.name}`).join(', '), true)
        .addField(`En réponse a :`,`${message.author.username}#${message.author.discriminator}`)
    message.channel.send(embed)
    }

    //CLEAR CHAT
    if(message.member.permissions.has("MANAGE_MESSAGES")){
        if(message.content.startsWith(prefix + "clear")){
            let args = message.content.split(" ");

            if(args[1] == undefined){
                message.reply("Nombre de message non ou mal défini !");
            }
            else {
                let number = parseInt(args[1]);

                if(isNaN(number)){
                    message.reply("Nombre de message non ou mal défini !");
                }
                else {
                    message.channel.bulkDelete(number).then(messages => {
                        console.log("Supression de " + messages.size + " messages réussi !");
                    }).catch(err => {
                        console.log("Erreur de clear : " + err);
                    });
                }
            }
        }
    }
    //CLEAR CHAT
    
    //MUSIQUE V.2
   if(message.content === prefix + "playlist"){
        let msg = "**FILE D'ATTENTE !**\n";
        for(var i = 0;i < list.length;i++){
            let name;
            await ytdl.getInfo(list[i], (err, info) => {
                if(err){
                    console.log("erreur de lien : " + err);
                    list.splice(i, 1);
                }
                else {
                    name = info.title;
                }
            });
            msg += "> " + i + " - " + name + "\n";
        }
        message.channel.send(msg);
    }
    else if(message.member.voice.channel){
        let args = message.content.split(" ");
        if(message.author.bot) return;
        if(args[1] == undefined || !args[1].startsWith("https://www.youtube.com/watch?v=")){
            
        }
        else {
            if(list.length > 0){
                list.push(args[1]);
                message.reply("Vidéo ajouté à la liste de lecture !");
            }
            else {
                list.push(args[1]);
                message.reply("Vidéo ajouté à la liste de lecture !");

                message.member.voice.channel.join().then(connection => {
                    playMusic(connection);

                    connection.on("disconnect", () => {
                        list = [];
                    });

                }).catch(err => {
                    message.reply("Erreur lors de la connexion : " + err);
                });
            }
        }
    }

    function playMusic(connection){
        let dispatcher = connection.play(ytdl(list[0], { quality: "highestaudio"}));

        dispatcher.on("finish", () => {
           list.shift();
           dispatcher.destroy();

           if(list.length > 0){
                   playMusic(connection);
           }
           else {
               connection.disconnect();
           }
        });

        dispatcher.on("error", err => {
            console.log("Erreur de dispatcher : " + err);
            dispatcher.destroy();
            connection.disconnect();
        });
    }
    //MUSIQUE V.2

    //COMMANDE BAN/KICK/MUTE
    if(message.member.hasPermission("ADMINISTRATOR")){
        if(message.content.startsWith(prefix + "ban")){
            let mention = message.mentions.members.first();

            if(mention == undefined){
                message.reply("Membre non ou mal mentionné !");
            }
            else {
                if(mention.bannable){
                    mention.ban();
                    message.channel.send(mention.displayName + " a été banni avec perfection !!!");
                }
                else {
                    message.reply("Impossible de bannir ce membre !");
                }
            }
        }
        else if(message.content.startsWith(prefix + "kick")){
            let mention = message.mentions.members.first();

            if(mention == undefined){
                message.reply("Membre non ou mal mentionné !");

            }
            else {
                if(mention.kickable){
                    mention.kick();
                    message.channel.send("**" + mention.displayName + "** a été kick avec succès !");
                }
                else {
                    message.reply("Impossible de kick ce membre !");
                }
            }
        }
        else if(message.content.startsWith(prefix + "mute")){
            let mention = message.mentions.members.first();

            if(mention == undefined){
                message.reply("Membre non ou mal mentionné !");
            }
            else {
                mention.roles.add("829374317174456401");
                message.channel.send("**" + mention.displayName + "** mute avec succès !");
            }
        }
        else if(message.content.startsWith(prefix + "unmute")){
            let mention = message.mentions.members.first();

            if(mention == undefined){
                message.reply("Membre non ou mal mentionné !");
            }
            else {
                mention.roles.remove("829374317174456401");
                message.channel.send(mention.displayName + " a été **unmute " + "**avec succès !");
            }
        }
        else if(message.content.startsWith(prefix + "tempmute")){
            let mention = message.mentions.members.first();

            if(mention == undefined){
                message.reply("Membre non ou mal mentionné !");
            }
            else {
                let args = message.content.split(" ");

                mention.roles.add("829374317174456401");
                message.reply("Membre bel est bien mute !");
                setTimeout(function() {
                    mention.roles.remove("829374317174456401");
                    message.channel.send("<@" + mention.id + "> tu peux désormais parler !");
                }, args[2] * 1000);
            }
        }
        //COMMANDE BAN/KICK/MUTE
    }

    // commande $ping
    if(message.content == prefix + "ping"){
        message.channel.send("pong");
    }

    if(message.content == prefix + "identifiant"){
        message.channel.send("**" + message.author.username + "** votre identifiant est le : **||" + message.author.id + "||**");
    }
});
//COMMANDE MESSAGE

    function Savebdd() {
        fs.writeFile("./bdd.json", JSON.stringify(bdd, null, 4), (err) => {
            if (err) message.channel.send("Une erreur est survenue.");
        });
    }
    

    /*******************************************
    ************ SYSTEME DE TICKETS ************
    *******************************************/
//    bot.on("messageReactionAdd", (reaction, user) => {
//        if (user.bot) return
//        if (reaction.emoji.name == "✅") {
//            reaction.message.channel.send('Tu as réagi : ✅');
//            reaction.message.guild.channels.create(`ticket de ${user.username}`, {
//                type: 'text',
//                parent: "829741906158026753",
//                permissionOverwrites: [{
//                    id: reaction.message.guild.id,
//                    deny: ['SEND_MESSAGES'],
//                    allow: ['ADD_REACTIONS']
//                }]
//            }).then(channel_ticket => {
//                channel_ticket.send("Channel crée !")
//            })
//        }
//    })



bot.login(process.env.TOKEN)