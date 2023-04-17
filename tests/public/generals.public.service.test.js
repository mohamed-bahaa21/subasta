const mongoose = require('mongoose');

const assert = require('assert');
const { expect } = require('chai');
const sinon = require('sinon');

const {
    findLegalPageContent, findFaqContent, findEmailInNewsletter, addEmailToNewsletter, sendEmailToUser
} = require('@services/first/public/generals.public.service');
const Newsletter = require('@models/Newsletter.model');

describe('GET /api/public/generals services', () => {
    let findStub;
    let db;

    before(() => {
        console.log('====================================');
        console.log("Started Generals.Public.Service.Test");
        console.log('====================================');
    })

    after(() => {
        console.log('====================================');
        console.log("Finished Generals.Public.Service.Test");
        console.log('====================================');
    });

    // findLegalPageContent
    it('should find the legal page content with the given name and language', async () => {
        // Setup
        const pageName = 'terms';
        const lang = 'en';

        // Execution
        const result = await findLegalPageContent(pageName, lang);

        // Assertion
        expect(result.name).to.equal(pageName);
        expect(result.lang).to.equal(lang);
        expect(result.content._id).to.equal(editorId);
    });

    it('should throw a Error if no legal page content is found with the given name and language', async () => {
        // Setup
        const pageName = 'throw error at me';
        const lang = 'throw error at me';

        // Execution
        const result = await findLegalPageContent(pageName, lang);

        // Execution and assertion
        expect(result).to.be.equal(null) || expect(result).to.be.an.instanceOf(Error);
    });
    // =====================================================================
    // findFaqContent
    it('should return FAQ content with the given language', async () => {
        // Setup
        const lang = 'en';

        // Execution
        const output = await findFaqContent(lang);

        // Assertion
        expect(output).to.be.an.instanceOf(Array);
    });
    // =========================================================================
    // findEmailInNewsletter
    it('should return null when email is not subscribed', async () => {
        // Setup
        const email = 'non_existing_email@example.com';

        // Execution
        const result = await findEmailInNewsletter(email);

        // Assert
        expect(result).to.be.null;
    });

    it('should return the subscribed email when email is found', async () => {
        // Setup
        const email = 'test@test.com';

        // Execution
        const result = await findEmailInNewsletter(email);

        // Assert
        expect(result).to.be.oneOf([null, new Newsletter()]);
        if (result instanceof Newsletter) {
            expect(result.email).to.equal(email);
        }
    });
    // =======================================================================
    // addEmailToNewsletter
    it('should add a new email to the newsletter', async () => {
        // Setup
        const email = 'newOne@test.com';

        // Execution
        const addOne = await addEmailToNewsletter(email);
        const result = await Newsletter.findOne({ email: addOne.email })

        // Assertion
        expect(result.email).to.be.oneOf([null, email]);
    });

    // =================================================================
    // sendEmailToUser
    it('should send an email to the given user email', async () => {
        // Setup
        const email = 'test@test.com';

        // Execution
        const result = await sendEmailToUser(email);

        // Assertion
        expect(result.message).to.be.oneOf(["Email was sent to the user.", "Couldn't notify the user by email."]);
    }).timeout(10000);

});