var nodemailer = require('nodemailer');
const accountSid = "AC82b53d7fcb524747264aad076b209d32";
const authToken = "94dfb285266891012af10ac727f6ac21";
const client = require('twilio')(accountSid, authToken);
class Communication{
    constructor(){

    }
    sendSms(content,to){
        let response = true;
        client.messages
        .create({
            body: content,
            from: '+18455529262',
            to: to
        })
        .then(message => console.log(message.sid))
        .catch(e => { 
            console.error('Got an error:', e.code, e.message); 
            response = false;
        });

        return response;

    }

    sendMail(from,content,to,header){

        var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'youremail@gmail.com',
            pass: 'yourpassword'
        }
        });

        var mailOptions = {
        from: from,
        to: to,
        subject: header,
        text: content
        };

        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
        });

            }
}
module.exports = new Communication();
//+18455529262 twilo sms phone number