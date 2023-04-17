// const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendBasicSMS(from, to, body) {
    // for development 
    return
    // let body = 'Hello from Twilio';
    // let from = '+1234567890';
    // let to = '+1234567890';
    try {
        await twilioClient.messages.create({
            body: body,
            from: from,
            to: to,
        });
    } catch (error) {
        throw new Error(610);
    }
};

module.exports = { sendBasicSMS }