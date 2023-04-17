const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/testing', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('====================================');
        console.log("Testing MongoDB Instance Started...");
        console.log('====================================');
    } catch (err) {
        console.log('====================================');
        console.log(err);
        console.log('====================================');
    }
}

async function close() {
    try {
        await mongoose.disconnect();
        console.log('====================================');
        console.log("Testing MongoDB Instance Stopped...");
        console.log('====================================');
    } catch (err) {
        console.log('====================================');
        console.error(err);
        console.log('====================================');
    }
}

module.exports = { connect, close }