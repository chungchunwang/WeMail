var WechatyBuilder = require('wechaty').WechatyBuilder;

const wechaty = WechatyBuilder.build() // get a Wechaty instance
var nodemailer = require('nodemailer');
var qrTerminal = require('qrcode-terminal');
const settings = require('./settings');

var transporter = nodemailer.createTransport({
  host: settings.host,
  port: settings.port,
  secure: true,
  auth: {
    user: settings.emailAddress,
    pass: settings.emailPassword,
  },
});

wechaty
  .on('scan', (qrcode, status) => {
    console.log("Scan QR Code to login: ");
    qrTerminal.generate(qrcode, { small: true })
})
  .on('login',            user => console.log(`User ${user} logged in`))
  .on('message', async message => {
    if(message.text() === "") return;
    var room = "Direct Message";
    if(message.room()) {
      room = await message.room().topic();
    }
    var eMessage = {
      from: "wangchongjun@hanvos-kent.com",
      to: "wangchongjun@hanvos-kent.com",
      subject: `Chat Message in ${room} by ${message.talker().name()}`,
      text: message.text(),
    };
    const fileTypeList = [
      wechaty.Message.Type.Attachment,
      wechaty.Message.Type.Video,
    ]
    if (fileTypeList.includes(message.type())) {
      const fileBox = await message.toFileBox()
      eMessage.subject = `File in ${room} by ${message.talker().name()}`
      eMessage.text = ``
      eMessage.attachments = [{
        filename: fileBox._name,
        content: fileBox.stream,
      }]
    }
    const imageTypeList = [
      wechaty.Message.Type.Image,
    ]
    if (imageTypeList.includes(message.type())) {
      const fileBox = await message.toFileBox()
      eMessage.subject = `Image in ${room} by ${message.talker().name()}`
      eMessage.text = ``
      eMessage.attachments = [{
        filename: "image.jpeg",
        content: fileBox.stream,
      }]
    }
    transporter.sendMail(eMessage, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  })
wechaty.start()