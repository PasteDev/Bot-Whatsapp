require('dotenv').config()
const qrcode = require("qrcode-terminal");
const fs = require('fs');
const { Client, MessageMedia, LocalAuth } = require("whatsapp-web.js");
const libre = require('libreoffice-convert');
const { Console } = require("console");
libre.convertAsync = require('util').promisify(libre.convert);


const country_code = process.env.COUNTRY_CODE;
const number = process.env.NUMBER;
const msg = process.env.MSG;


const client = new Client({ puppeteer: { headless: true } });


client.on("qr", qr => {
    qrcode.generate(qr, { small: true });
});
client.on('authenticated', () => {
    console.log('Bot -> Autentificado');
})

client.on("auth_failure", msg => {
    console.log('Bot -> Autentificación Fallida', msg);
})

client.on("ready", () => {
    console.log("Bot -> El cliente está activo");
    let chatId = country_code + number + "@c.us";
    client.sendMessage(chatId, msg)
        .then(response => {
            if (response.id.fromMe) {
                console.log("Bot -> Estoy funcionando correctamente!");
            }
        })
});


const myLogger = new Console({
    stdout: fs.createWriteStream("./Logs/log.txt"),
    stderr: fs.createWriteStream("./Logs/errorLog.txt"),
});


client.on("message_create", async message => {
    if (!message.fromMe) {
        if (message.hasMedia) {
            const downloaded = await message.downloadMedia()
            const buffer = Buffer.from(downloaded.data, "base64");
            switch (downloaded.mimetype) {
                case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                case "application/msword":
                case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                case "application/vnd.ms-powerpoint":
                case "application/vnd.ms-excel":
                case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                    const tosend = await libre.convertAsync(buffer, ".pdf", undefined)
                    const att = new MessageMedia("application/pdf", tosend.toString("base64"), downloaded.filename.split(".").slice(0, -1).join("."))
                    message.reply(att);
                    const contact = await message.getContact();
                    const CodeCountry = await contact.getCountryCode();
                    const formattedNumber = await contact.getFormattedNumber()
                    const nationalPhoneCode = require('national-phone-code')
                    const country = nationalPhoneCode.getCodeInfo(CodeCountry).english_name
                    const timestamp = require('moment-timezone');
                    myLogger.log("[" + timestamp.tz("America/Argentina/Buenos_Aires").format("DD/MM - HH:mm") + "] [" + country + "] (" + contact.pushname + " | " + formattedNumber + ") mandó un Archivo para convertirlo en PDF");
                    console.log("[" + timestamp.tz("America/Argentina/Buenos_Aires").format("DD/MM - HH:mm") + "] [" + country + "] (" + contact.pushname + " | " + formattedNumber + ") mandó un Archivo para convertirlo en PDF");

                    break;
                }
                case 'image/jpeg': {
                    const sharp = require('sharp');
                    const bufferImage = await sharp(buffer)
                        .resize(500, 500)
                        .webp()
                        .toBuffer()
                    const base64Image = bufferImage.toString("base64");
                    const messageMedia = new MessageMedia("image/webp", base64Image, "sticker.webp");

                    await message.reply(messageMedia, null, { sendMediaAsSticker: true, stickerAuthor: '+543644178536', stickerName: 'Whatsapp Bot' });
                    const contact = await message.getContact();
                    const CodeCountry = await contact.getCountryCode();
                    const formattedNumber = await contact.getFormattedNumber()
                    const nationalPhoneCode = require('national-phone-code')
                    const country = nationalPhoneCode.getCodeInfo(CodeCountry).english_name
                    const timestamp = require('moment-timezone');
                    myLogger.log("[" + timestamp.tz("America/Argentina/Buenos_Aires").format("DD/MM - HH:mm") + "] [" + country + "] (" + contact.pushname + " | " + formattedNumber + ") mandó una Imagen para convertirla en Sticker");
                    console.log("[" + timestamp.tz("America/Argentina/Buenos_Aires").format("DD/MM - HH:mm") + "] [" + country + "] (" + contact.pushname + " | " + formattedNumber + ") mandó una Imagen para convertirla en Sticker");
                    break;
                }
                case 'video/mp4': {
                    await message.reply(downloaded, null, { sendMediaAsSticker: true, stickerAuthor: '+543644178536', stickerName: 'Whatsapp Bot' });
                    const contact = await message.getContact();
                    const CodeCountry = await contact.getCountryCode();
                    const formattedNumber = await contact.getFormattedNumber()
                    const nationalPhoneCode = require('national-phone-code')
                    const country = nationalPhoneCode.getCodeInfo(CodeCountry).english_name
                    const timestamp = require('moment-timezone');
                    myLogger.log("[" + timestamp.tz("America/Argentina/Buenos_Aires").format("DD/MM - HH:mm") + "] [" + country + "] (" + contact.pushname + " | " + formattedNumber + ") mandó un Gif/Video para convertirlo en Sticker Animado");
                    console.log("[" + timestamp.tz("America/Argentina/Buenos_Aires").format("DD/MM - HH:mm") + "] [" + country + "] (" + contact.pushname + " | " + formattedNumber + ") mandó un Gif/Video para convertirlo en Sticker Animado");
                    break;
                }
            }
        }
    }

});


const tiktok = require('tiktok-scraper-without-watermark')
client.on("message_create", async message => {
    if (!message.fromMe) {
        if (message.links[0]) {
            const chat = await message.getChat();
            await chat.sendMessage("⏱️| *Espera un momento.*")
            tiktok.tiktokdownload(message.links[0]?.link).then(async result => {
                const b64 = Buffer.from(await fetch(result.nowm).then(e => e.arrayBuffer())).toString("base64");
                const att = new MessageMedia("video/mp4", b64, "tiktok.mp4");
                chat.sendMessage(att)

                const contact = await message.getContact();
                const CodeCountry = await contact.getCountryCode();
                const formattedNumber = await contact.getFormattedNumber()
                const nationalPhoneCode = require('national-phone-code')
                const country = nationalPhoneCode.getCodeInfo(CodeCountry).english_name
                const timestamp = require('moment-timezone');
                myLogger.log("[" + timestamp.tz("America/Argentina/Buenos_Aires").format("DD/MM - HH:mm") + "] [" + country + "] (" + contact.pushname + " | " + formattedNumber + ') Descargó el TikTok "'+message.links[0]?.link+'" ');
                console.log("[" + timestamp.tz("America/Argentina/Buenos_Aires").format("DD/MM - HH:mm") + "] [" + country + "] (" + contact.pushname + " | " + formattedNumber + ') Descargó el TikTok "'+message.links[0]?.link+'" ');
            })
        }
    }
})


client.on('group_join', async message => {
    const chat = await message.getChat();
    const foto = "https://c.tenor.com/Or_pMDyHdygAAAAd/no-no-no-nope.gif"
    const media = await MessageMedia.fromUrl(foto);
    await chat.sendMessage(media, { caption: '⚠️| *No pueden agregarme a Grupos!*\n\n_Si deseas usarme mandame un mensaje por_ *PRIVADO*' })
    await new Promise((s) => setTimeout(s, 2000))
    await chat.leave();
    const contact = await message.getContact();
    const CodeCountry = await contact.getCountryCode();
    const formattedNumber = await contact.getFormattedNumber()
    const nationalPhoneCode = require('national-phone-code')
    const country = nationalPhoneCode.getCodeInfo(CodeCountry).english_name
    const groupname = chat.name
    const timestamp = require('moment-timezone');
    myLogger.log("[" + timestamp.tz("America/Argentina/Buenos_Aires").format("DD/MM - HH:mm") + "] [" + country + "] (" + contact.pushname + " | " + formattedNumber + ") intentó agregarme al grupo " + groupname + " pero no pudo.");
    console.log("[" + timestamp.tz("America/Argentina/Buenos_Aires").format("DD/MM - HH:mm") + "] [" + country + "] (" + contact.pushname + " | " + formattedNumber + ") intentó agregarme al grupo " + groupname + " pero no pudo.");

});


client.initialize();
