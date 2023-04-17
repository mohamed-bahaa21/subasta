const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
// Models
const Newsletter = require('../models/Newsletter.model');
const Category = require('../models/Category.model');
const Product = require('../models/Product.model');
const Auction = require('../models/Auction.model');
const FAQ = require('../models/FAQ.model');
const LegalPage = require('../models/LegalPage.model');

const User = require('@models/User.model')
const Bid = require('@models/Bid.model')

mongoose.connect('mongodb://127.0.0.1:27017/goinggone_test', { useNewUrlParser: true, useUnifiedTopology: true });

const dataDir = path.join(__dirname);
const seedDir = path.join(__dirname, 'db');

const seedData = async (model, seedFile, modelName) => {
    try {
        console.log('====================================');
        console.log(`${modelName} Started Seeding...`);
        console.log('====================================');
        const data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
        let index = 0;
        for (const item of data) {
            const { name } = item;

            const firstKey = Object.keys(data[index])[0]; // get the first key in the seeds array
            const firstValue = Object.values(data[index])[0]; // get the first value in the seeds array
            const uniqueValues = data.map(obj => obj[firstKey]); // get an array of unique values in the first key
            // const duplicates = await model.find({ [firstKey]: { $in: uniqueValues } }).distinct(firstKey); // find duplicates in the database by searching for matching values in the first key

            console.log(firstKey);
            console.log(firstValue);
            const existingItem = await model.findOne({ [firstKey]: firstValue });

            if (!existingItem) {
                await model.create(item);
                console.log(`Seed data for ${model.modelName} added successfully`);
            } else {
                console.log(`Seed data for ${model.modelName} already exists`);
            }

            index++;
        }

        console.log('====================================');
        console.log(`${modelName} Finished Seeding...`);
        console.log('====================================');
    } catch (err) {
        console.log('====================================');
        console.log(`${modelName} Failed Seeding...`);
        console.log('====================================');
        console.error(err);
        return;
    }
};

const seedAllData = async () => {
    try {
        await seedData(Newsletter, path.join(dataDir, 'Newsletters.seeds.test.json'), "Newsletter");
        await seedData(Auction, path.join(dataDir, 'Auction.seeds.test.json'), "Auction");
        await seedData(Category, path.join(dataDir, 'Category.seeds.test.json'), "Category");
        await seedData(Product, path.join(dataDir, 'Product.seeds.test.json'), "Product");
        await seedData(FAQ, path.join(dataDir, 'FAQ.seeds.test.json'), "FAQ");
        await seedData(LegalPage, path.join(dataDir, 'LegalPage.seeds.test.json'), "LegalPage");
        // Add more seed data files here as needed
    } catch (err) {
        console.error(err);
    }
    mongoose.connection.close();
};

seedAllData();






















// const fs = require('fs');
// const path = require('path');
// const mongoose = require('mongoose');

// // set up mongoose connection
// mongoose.connect('mongodb://localhost/going2gone_test', { useNewUrlParser: true, useUnifiedTopology: true });

// // require all models
// const modelsPath = path.join(__dirname, '../models');
// fs.readdirSync(modelsPath).forEach(file => {
//     require(path.join(modelsPath, file));
// });

// // import seed data into local mongodb
// const dataPath = path.join(__dirname, 'db');
// fs.readdirSync(dataPath).forEach(file => {
//     const seedData = require(path.join(dataPath, file));
//     const Model = mongoose.model(file.split('.')[0]);

//     seedData.forEach(item => {
//         const firstKey = Object.keys(item)[0];
//         const query = { [firstKey]: item[firstKey] };
//         Model.findOneAndUpdate(query, item, { upsert: true }, (err) => {
//             if (err) {
//                 console.log(`Error importing ${file}: ${err.message}`);
//             } else {
//                 console.log(`Successfully imported ${file} to ${Model.modelName}`);
//             }
//         });
//     });
// });