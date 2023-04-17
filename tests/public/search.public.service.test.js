const { expect } = require('chai');

const {
    searchAuctionsByStatus,
    searchAuctionsByCategory,
    searchOngoingAuctions,
    searchCompletedAuctions,
    searchAuctionsByTimeRange,
    searchAuctionsByKeyword,
} = require('@services/first/public/search.public.service');
const { close } = require('../db.test');

describe('GET /api/public/search services', () => {
    let findStub;
    let db;

    before(async () => {
        console.log('====================================');
        console.log("Started Search.Public.Service.Test");
        console.log('====================================');
    })

    after(async () => {
        console.log('====================================');
        console.log("Finished Generals.Public.Service.Test");
        console.log('====================================');
        await close();
    });

    // searchAuctionsByStatus,
    it('should return auctions with the given status', async () => {
        // Actions:
        const status = 'running';
        const result = await searchAuctionsByStatus(status);
        // console.log(result.length);

        // Expectations:
        expect(result).to.be.an.instanceOf(Error)
        if (result.length > 0) {
            for (let i = 0; i < result.length; i++) {
                const auction = result[i];
                expect(auction.status).to.equal(status);
            }
        }
        if (typeof result == null) {
            expect(result).to.be.equal(null)
        } else {
            expect(result).to.be.an.instanceOf(Error)
        }
    }).timeout(5000);

    // searchAuctionsByCategory,
    it('should return auctions with the given categoryid', async () => {
        // Actions: 
        const categoryID = '12344363457345'; // MongoDB ObjectId
        const result = await searchAuctionsByCategory(categoryID);

        // Expectations

    }).timeout(5000);

    // searchOngoingAuctions,
    it('should return ongoing auctions', async () => {
        // Actions: 
        let now = new Date();
        const tomorrow = new Date(Date.now() + 86400000);
        const yesterday = new Date(Date.now() - 86400000);
        let status = 'running'

        const result = await searchOngoingAuctions(yesterday, tomorrow);

        // Expectations
        expect(result[0].status).to.be.equal(status);
        expect(result[0].startingDate).to.be.lessThanOrEqual(yesterday);
        expect(result[0].endingDate).to.be.greaterThanOrEqual(tomorrow);

    }).timeout(5000);

    // searchCompletedAuctions,
    it('should return completed auctions', async () => {
        // Actions: 
        const endingDate = new Date();
        const status = 'completed';
        const result = await searchCompletedAuctions();

        // Expectations
        if (result.length > 0) {
            expect(result[0].status).to.be.equal(status);
            expect(result[0].endingDate).to.be.lessThanOrEqual(endingDate);
        }
    }).timeout(5000);

    // searchAuctionsByTimeRange,
    it('should return auctions with the given time range', async () => {
        // Actions: 
        const startingDate = new Date('2022-02-17T00:00:00.000Z');
        const endingDate = new Date('2022-02-24T00:00:00.000Z');
        const result = await searchAuctionsByTimeRange(startingDate, endingDate);


        // Expectations
        expect(result).to.be.an('array');
        expect(result).to.have.lengthOf.at.least(0);
        if (result.length > 0) {
            expect(result[0].startingDate).to.be.greaterThanOrEqual(startingDate);
            expect(result[0].endingDate).to.be.lessThanOrEqual(endingDate);
        }
    }).timeout(5000);

    // searchAuctionsByKeyword,
    it('should return auctions with the given keyword', async () => {
        // Actions: 
        const keyword = 'iPhone';
        const result = await searchAuctionsByKeyword(keyword);

        // Expectations
        expect(result.length).to.be.oneOf(1);
        if (result) {
            expect(result[0].name).toBe('iPhone 12 Pro Max');
        }
    }).timeout(5000);
});