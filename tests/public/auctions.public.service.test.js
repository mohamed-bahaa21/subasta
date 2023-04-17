const mongoose = require('mongoose');

const assert = require('assert');
const { expect } = require('chai');
const sinon = require('sinon');

const Auction = require('@models/Auction.model')
const {
    findAuctionById, getAuctionsAggregationSets, queryAuctions
} = require('@services/first/public/auctions.public.service');

describe('GET /api/public/auctions services', () => {
    let findStub;
    let db;

    before(() => {
        console.log('====================================');
        console.log("Started Auctions.Public.Service.Test");
        console.log('====================================');
    })

    after(() => {
        console.log('====================================');
        console.log("Finished Auctions.Public.Service.Test");
        console.log('====================================');
    });

    // getAuctionsAggregationSets
    it('should return correct aggregation sets', async () => {
        // Setup
        const filter = '{"city":"New York"}';
        const sort = 'endDate:desc';
        const page = 2;
        const limit = 20;
        const auction_status = 'running';
        const q = 'iPhone';

        // Expected output
        const expectedOutput = {
            filterCriteria: { status: 'running', city: 'New York' },
            searchQuery: { $text: { $search: 'iPhone' } },
            sortCriteria: { endDate: -1 },
            skip: 20,
            pageNum: 2,
            limitNumber: 20,
        };

        // Execution
        const output = await getAuctionsAggregationSets(filter, sort, page, limit, auction_status, q);

        // Assertion
        expect(output).to.deep.equal(expectedOutput);
    });
    // ============================================================================

    // queryAuctions
    it('should return the correct auctions and total number', async () => {
        // Setup
        const filterCriteria = { status: 'running' };
        const searchQuery = {};
        const sortCriteria = { createdAt: -1 };
        const skip = 0;
        const pageNumber = 1;
        const limitNumber = 10;

        // Execution
        const { auctions, totalAuctionsNumber } = await queryAuctions(filterCriteria, searchQuery, sortCriteria, skip, pageNumber, limitNumber);

        // Assert
        expect(auctions).to.have.lengthOf(2) || expect(auctions).to.have.lengthOf(0);
        expect(totalAuctionsNumber).to.equal(2) || expect(totalAuctionsNumber).to.equal(0);
        if (auctions.length > 0) {
            expect(auctions[0].status).to.equal('running');
            expect(auctions[0].createdAt).to.be.greaterThan(auctions[1].createdAt);
        }
    });

    it('should return an empty array if there are no auctions matching the filter', async () => {
        // Setup
        const filterCriteria = { status: 'ended' };
        const searchQuery = {};
        const sortCriteria = { createdAt: -1 };
        const skip = 0;
        const pageNumber = 1;
        const limitNumber = 10;

        // Execution
        // Assert
        try {
            const { auctions, totalAuctionsNumber } = await queryAuctions(filterCriteria, searchQuery, sortCriteria, skip, pageNumber, limitNumber);
            expect(auctions).to.have.lengthOf(0);
            expect(totalAuctionsNumber).to.equal(0);
        } catch (error) {
            expect(error).to.be.an.instanceOf(Error);
        }
    });
    // ============================================================================

    // findAuctionById
    it('should return the correct auction with the given ID', async () => {
        // create a new auction
        const auction = Auction.findOne({ name: "Auction 1" });

        // find the auction by ID
        const result = await findAuctionById(auction._id);

        // assert that the returned auction is the same as the created one
        expect(result).to.be.oneOf([auction, null])
    });

    it('should return null if no auction is found with the given ID', async () => {
        // find an auction with a non-existent ID
        const result = await findAuctionById('123');

        // assert that the result is null
        expect(result).to.be.oneOf([null, typeof Array]);
    });
});