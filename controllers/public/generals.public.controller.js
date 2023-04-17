const {
    findLegalPageContent, findFaqContent,
    findEmailInNewsletter, addEmailToNewsletter, sendEmailToUser,
} = require('@services/first/public/generals.public.service');
const { sendBasicEmail } = require('@services/third/sendgrid/SendGrid.service');
const { sendBasicSMS } = require('@services/third/twilio/Twilio.service');

// GET legal pages content (privacy, terms, etc) for a specific language (en, es, er, fr)
async function getLegalPage(req, res, next) {
    let { pageName, lang } = req.params;

    try {
        let pageContent = await findLegalPageContent(pageName, lang);
        res.status(200).json(pageContent)
    } catch (error) {
        next(error)
    }
}
// GET FAQ page for a specific language (en, es, er, fr)
async function getFaqPage(req, res, next) {
    let { lang } = req.params;
    try {
        let FAQ = await findFaqContent(lang);
        res.status(200).json(FAQ)
    } catch (error) {
        next(error)
    }
}
// POST subscribe to the newsletter.
async function postSubscribeToNewsletter(req, res, next) {
    let { email } = req.body;

    try {
        await findEmailInNewsletter(email);
        await addEmailToNewsletter(email);
        await sendEmailToUser(email);

    } catch (error) {
        next(error)
    }
}
// POST contact us form (TBD the email & SMS provider).
async function postContactUs(req, res, next) {
    const { name, phone, email, subject, message } = req.body;

    try {
        let from_name = name;
        let from_subject = subject;
        let from_message = message;
        let from_email = email;
        let from_phone = phone;

        let to_email;
        let to_phone;

        await sendBasicSMS(from_phone, to_phone, from_message);
        await sendBasicEmail(from_email, to, from_subject, from_message);

        return res.status(200).json({ message: "Message sent successfully." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error sending message." });
    }
}

module.exports = {
    getLegalPage,
    getFaqPage,
    postSubscribeToNewsletter,
    postContactUs
}