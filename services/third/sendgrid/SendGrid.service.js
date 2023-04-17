const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)

async function sendBasicEmail(from, to, subject, html) {
    // for development
    return
    
    try {
        await sgMail.send({
            from: `${from}`,
            to: `${to}`,
            subject: `${subject}`,
            html: `${html}`
        })
    } catch (error) {
        throw new Error(606);
    }
};

module.exports = { sendBasicEmail }