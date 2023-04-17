const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createStripeAccount(user, card) {
    let { userId, firstName, lastName, email, phone, streetAddress, streetAddress2, city, state, postalCode, country, addressType } = user;
    let { cardNumber, nameOnCard, expirationDate, cvv } = card;

    try {
        const customer = await stripe.customers.create({
            name: `${firstName} ${lastName}`,
            email,
            phone,
            address: {
                line1: streetAddress,
                line2: streetAddress2,
                city,
                state,
                postal_code: postalCode,
                country,
            },
            payment_method: {
                card: {
                    number: cardNumber,
                    exp_month: expirationDate.month,
                    exp_year: expirationDate.year,
                    cvc: cvv,
                },
                billing_details: {
                    name: nameOnCard,
                    address: {
                        line1: streetAddress,
                        line2: streetAddress2,
                        city,
                        state,
                        postal_code: postalCode,
                        country,
                    },
                },
            },
        });

        return customer;
    } catch (error) {
        console.error('Error creating Stripe account:', error);
        throw new Error('Error creating Stripe account');
    }
}

async function getStripeAccount(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (!user.stripeAccountId) throw new Error("User does not have a Stripe account");

    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    return account;
}

async function updateStripeAccount(userId, fieldsToUpdate) {
    const user = await User.findById(userId);
    // let {} = fieldsToUpdate;

    if (!user) throw new Error("User not found");
    if (!user.stripeAccountId) throw new Error("User does not have a Stripe account");

    const account = await stripe.accounts.update(user.stripeAccountId, fieldsToUpdate);
    return account;
}

async function createStripeAccountLink(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (!user.stripeAccountId) throw new Error("User does not have a Stripe account");

    const accountLink = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        refresh_url: "https://example.com/reauth",
        return_url: "https://example.com/return",
        type: "account_onboarding",
    });

    return accountLink;
}

module.exports = {
    createStripeAccount,
    getStripeAccount,
    updateStripeAccount,
    createStripeAccountLink,
}