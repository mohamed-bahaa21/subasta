let SendGrid = require('../../third/sendgrid/SendGrid.service')

const LegalPages = require('@models/LegalPage.model')
const FAQ = require('@models/FAQ.model')
const Newsletter = require('@models/Newsletter.model')

async function findLegalPageContent(pageName, lang) {
    try {
        let legalPageContent = await LegalPages.findOne({ name: pageName, lang: lang }).populate('content')
        return legalPageContent;
    } catch (error) {
        throw new Error(602)
    }
}

async function findFaqContent(lang) {
    try {
        let faqContent = await FAQ.find({ language: lang });
        return faqContent
    } catch (error) {
        throw new Error(603)
    }
}

async function findEmailInNewsletter(email) {
    try {
        let subscribedEmail = await Newsletter.findOne({ email: email })
        if (subscribedEmail) return subscribedEmail

        return null
    } catch (error) {
        throw new Error(604)
    }
}

async function addEmailToNewsletter(email) {
    try {
        let subscribeEmail = await Newsletter.create({ email: email })
        return subscribeEmail
    } catch (error) {
        throw new Error(605)
    }
}

async function sendEmailToUser(email) {

    let from = 'admin@outlook.com'
    let to = email;
    let subject = 'We are Super Excited 🤗 to welcome you.';
    let html = `
    <h3 style="text-align: center">Hello There <br>
        Our aucitons are the best. 🚀 <br>
        Stay tuned for new ones! <br>
        Auctions made with ❤, good luck <br>
    </h3>
    `

    try {
        let sendEmail = await SendGrid.sendBasicEmail(from, to, subject, html);
        if (sendEmail) {
            return { message: "Email was sent to the user." };
        } else {
            return { message: "Couldn't notify the user by email." }
        }
    } catch (error) {
        throw error
    }
}

module.exports = {
    findLegalPageContent, findFaqContent,
    findEmailInNewsletter, addEmailToNewsletter, sendEmailToUser,
}