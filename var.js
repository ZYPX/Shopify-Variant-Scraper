const Discord = require("discord.js");
const got = require('got');
const client = new Discord.Client();

const bot_token = "";

client.login(bot_token);

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
    let parsedMsg = message.content.split(" ");

    if (["!shopify", "!var", "!vars", "!variants", "-shopify", "!variant"].includes(parsedMsg[0].toLowerCase())){
        let baseURLR = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\/\b/g;
        let baseURL = baseURLR.exec(parsedMsg[1]);
        let productEXTR = /products([^?]+)/;
        let productEXT = productEXTR.exec(parsedMsg[1]);

        if ((baseURL !== null) && (productEXT !== null)){
            let endpoint = baseURL[0]+productEXT[0]+"/variants.json";
            (async () => {
                try {
                    let startTime = Date.now();
                    let response = await got(endpoint, {
                        responseType: 'json',
                        headers: {
                            'accept': 'application/json',
                            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Safari/537.36'
                        }
                        
                    });
                    let msElapsed = Date.now() - startTime;
                    let productJSON = response.body;
                    let variantArray = productJSON.product.variants;
                    let productName = productJSON.product.title;
                    let productImage = "https://cdn.discordapp.com/embed/avatars/0.png";
                    try{
                        productImage = productJSON.product.images[0].src.split("?")[0];
                    } catch (e){
                        console.log("No image");  
                    }
                    let ids = [];
                    let sizes = [];
                    let stockNum = [];
                    let totalStock = 0;
                    let pp = false;
                    console.log(msElapsed);
                    if (msElapsed > 5000) {
                        pp = true;
                        //console.log("PP ON");
                    }
                    for(let i=0; i<variantArray.length; i++){
                        ids.push(variantArray[i].id);
                        sizes.push(variantArray[i].title);
                        if (variantArray[i].hasOwnProperty('inventory_quantity')){
                            console.log(variantArray[i].inventory_quantity);
                            stockNum.push(variantArray[i].inventory_quantity);
                            totalStock += variantArray[i].inventory_quantity;
                        }
                        
                    }
    
                    console.log(stockNum.length);
                    if (stockNum.length > 0){
                        if (totalStock === 0) {
                            let embed = embedder(productName, parsedMsg[1], productImage, ids, sizes, pp);
                            message.channel.send(embed);
                        }
                        else {
                            let stock = stockEmbed(productName, parsedMsg[1], productImage, sizes, stockNum, totalStock, ids, pp);
                            message.channel.send(stock);
                        }
                    }
                    else {
                        let embed = embedder(productName, parsedMsg[1], productImage, ids, sizes, pp);
                        message.channel.send(embed);
                    }

                } catch (error) {
                    console.log(error);
                    console.log(error.response.statusCode);
                    if (error.response.statusCode === 404){
                        message.channel.send("Could not fetch variants! Error: "+error.response.statusCode+" Page Does Not Exist");
                    }
                    else{
                        message.channel.send("Could not fetch variants! Error: "+error.response.statusCode+" Unknown Error Occurred");
                    }
                }
            })();
            
        }
        else {
            message.channel.send("Could not fetch variants! Error: Invalid URL given");
        }
        
        
    }
    if (parsedMsg[0].toLowerCase() === "!rates"){
        message.channel.send("https://docs.google.com/document/d/13nEiRz__SHVIaLVXrw6uSXwg60UtV038607QymMG8rs");
    }
});

function embedder(name, link, image, vars, sizes, pp){
    let balkoFormat = balko(vars, sizes);
    let nebFormat = nebula(vars);
    let proxyProt = ":x:";
    if (pp == true) {
        console.log("hi");
        proxyProt = ":white_check_mark:";
    }
    var embed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setURL('https://discord.js.org/')
	.setAuthor(name, '', link)
	.setThumbnail(image)
	.addFields(
		{ name: 'Size - Variant', value: "```"+balkoFormat+"```", inline: true },
		{ name: 'Variant', value: "```"+nebFormat+"```", inline: true },
        { name: 'Proxy Protection', value: proxyProt, inline: false }
	)
	.setTimestamp()
	.setFooter('Made by 12', 'https://cdn.discordapp.com/emojis/691715611780317184.png?v=1');
	return embed;
}

function stockEmbed(name, link, image, sizes, stock, total, vars, pp){
    let stockFormatted = "";
    let sizesFormatted = "";
    let proxyProt = ":x:";
    if (pp == true) {
        console.log("hi");
        proxyProt = ":white_check_mark:";
    }

    let nebFormat = nebula(vars); 
    for (var i = 0; i<sizes.length; i++){
        console.log(stock[i]);
        sizesFormatted += ("\n"+sizes[i].toString().replace(/\-/g, ''));
        stockFormatted += ("\n"+stock[i].toString().replace(/\-/g, ''));
    }

    
    var embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setURL('https://discord.js.org/')
    .setAuthor(name, '', link)
    .setThumbnail(image)
    .addFields(
        { name: 'Size', value: "```"+sizesFormatted+"```", inline: true },
		{ name: 'Variant', value: "```"+nebFormat+"```", inline: true },
        { name: 'Stock', value: "```"+stockFormatted+"```", inline: true },
        { name: 'Total Stock', value: total.toString().replace(/\-/g, ''), inline: true },
        { name: 'Proxy Protection', value: proxyProt, inline: true }
    )
    .setTimestamp()
    .setFooter('Made by 12', 'https://cdn.discordapp.com/emojis/691715611780317184.png?v=1');
    return embed;
    
	
}

function balko(ids, sizes){
    let balkoFormat = "";
    for (var i = 0; i<ids.length; i++){

        if (sizes[i] === ""){
            balkoFormat += ("\n"+ids[i]);
        }
        else{
            balkoFormat += ("\n"+sizes[i]+" - "+ids[i]);
        }
    }

    return balkoFormat;
}

function nebula(ids){
    let nebFormat = "";
    for (var i = 0; i<ids.length; i++){
        nebFormat += ("\n"+ids[i]);
    }
    return nebFormat;
}