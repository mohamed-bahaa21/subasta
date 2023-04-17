// /api/admin/auctions
const express = require('express');
const router = express.Router();
const slugify = require('slugify');
// Models
const Auction = require('@models/Auction.model');
const Product = require('@models/Product.model');
// Validators
const { ParamsBodyFilesValidation, BodyValidation, QueryValidation, ParamsValidation } = require("@validators/index.validator");
const validationSchemes = require('@validators/admin.validator')
// Middlewares
const { authenticateAdmin } = require('@middlewares/auth.rest.middleware');
// Utils
const admin = require('@config/user.firebase.config')
const { storagestorageBucket } = require('@config/user.firebase.config');
const { getImages, uploadImage, deleteImage, resizeImage } = require('@services/third/firebase/firebase.service');

// GET all auctions with pagination, sorting, filtering, and search
router.get("/",
    QueryValidation(validationSchemes.auctionValidationSchemas['/'].get),
    authenticateAdmin, async (req, res) => {
        try {
            const { page, limit, sort, search, filter } = req.query;

            // Set default values for pagination
            const currentPage = parseInt(page) || 1;
            const perPage = parseInt(limit) || 10;
            const skip = (currentPage - 1) * perPage;

            // Set default value for sorting
            const sortBy = sort ? { [sort]: 1 } : { createdAt: -1 };

            // Create query object for filtering
            let query = {};
            if (filter) {
                const filters = filter.split(",");
                filters.forEach((f) => {
                    const [key, value] = f.split(":");
                    query[key] = value;
                });
            }

            // Create regex object for searching
            let searchQuery = {};
            if (search) {
                const regex = new RegExp(search, "i");
                searchQuery = {
                    $or: [
                        { name: regex },
                        { description: regex },
                        { supplierName: regex },
                        { publicId: regex },
                    ],
                };
            }

            const auctions = await Auction.find({
                ...query,
                ...searchQuery,
            })
                .populate("ownerId", "username email")
                .populate("productId")
                .sort(sortBy)
                .skip(skip)
                .limit(perPage);

            const count = await Auction.countDocuments({ ...query, ...searchQuery });

            res.status(200).json({ auctions, totalPages: Math.ceil(count / perPage) });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

// GET auction details
router.get("/:id",
    ParamsValidation(validationSchemes.auctionValidationSchemas['/:id'].get),
    authenticateAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const auction = await Auction.findById(id)
                .populate("ownerId", "username email")
                .populate("productId")
                .populate({
                    path: "bids",
                    populate: {
                        path: "bidderId",
                        select: "username email",
                    },
                })
                .populate({
                    path: "latestBid",
                    populate: {
                        path: "bidderId",
                        select: "username email",
                    },
                });

            if (!auction) return res.status(404).json({ error: "Auction not found" });
            const auctionImages = await getImages(auction._id);

            res.status(200).json({ auction, auctionImages });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

// PUT update auction details, status, images, everything
router.put("/:id",
    ParamsBodyFilesValidation(validationSchemes.auctionValidationSchemas['/:id'].put),
    authenticateAdmin, async (req, res) => {
        try {
            const { id } = req.params;

            const auction = await Auction.findById(id);
            if (!auction) return res.status(404).json({ error: "Auction not found" });

            const fieldsToUpdate = [
                'name', 'description', 'supplierName', 'status', 'statusMessage',
                'paymentStatus', 'paymentMethod', 'startingDate', 'endingDate', 'startingPrice',
                'bidMinimumDifference', 'handlingFee', 'totalBids', 'finalPrice'
            ];
            fieldsToUpdate.forEach((field) => {
                if (req.body[field]) {
                    auction[field] = req.body[field];
                }
            });

            if (req.files && req.files.images) {
                const images = req.files.images;

                // Delete previous images from Firebase storage
                if (auction.images && auction.images.length > 0) {
                    await Promise.all(auction.images.map(async (image) => {
                        try {
                            await deleteImage(storageBucket, image);
                        } catch (error) {
                            console.log(error);
                        }
                    }));
                }

                const imageUrls = [];

                // Upload new images to Firebase storage and resize them
                await Promise.all(images.map(async (image) => {
                    try {
                        const imageUrl = await uploadImage(storageBucket, image);
                        const resizedImageUrl = await resizeImage(storageBucket, imageUrl);
                        imageUrls.push(resizedImageUrl);
                    } catch (error) {
                        console.log(error);
                    }
                }));

                auction.images = imageUrls;
            }

            await auction.save();

            res.status(200).json({ message: "Auction updated successfully", auction });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

// POST create a new auction. (TBD)
router.post("/", BodyValidation(validationSchemes.auctionValidationSchemas['/'].post), authenticateAdmin, async (req, res) => {
    try {
        const { name, description, ownerId, productId, supplierName, status, startingDate, endingDate, startingPrice, handlingFee, bidMinimumDifference, } = req.body;

        const publicId = slugify(name, { lower: true });
        const existingProduct = await Product.findOne({ productId });
        if (existingProduct) return res.status(400).json({ error: "Product with this name already exists" });

        const newProduct = new Product({ publicId, name, category, description, images, });
        const savedProduct = await newProduct.save();

        const newAuction = new Auction({
            publicId: publicId,
            product: savedProduct,
            supplierName,
            startingDate,
            endingDate,
            startingPrice,
            bidMinimumDifference,
            handlingFee,
        });

        const savedAuction = await newAuction.save();

        res.status(201).json({ message: "Auction created successfully", auction: savedAuction });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;