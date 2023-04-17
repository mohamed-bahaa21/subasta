const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// Models
const { User } = require("@models/User.model");
// Validators
const { ParamsBodyValidation, QueryValidation, ParamsValidation } = require("@validators/index.validator");
const validationSchemes = require('@validators/admin.validator')
// Middlewares
const { authenticateAdmin } = require("@middlewares/auth.rest.middleware");
// Utils
const admin = require("firebase-admin");

// GET all users (Filter, sort, pagination, and search).
router.get('/',
    QueryValidation(validationSchemes.userValidationSchemas['/']),
    authenticateAdmin, async (req, res) => {
        try {
            const { search, filter, sort, page, limit } = req.query;

            // Define the filtering logic
            const filterObj = {};
            if (filter) {
                if (filter.displayName) {
                    filterObj.displayName = { $regex: filter.displayName, $options: 'i' };
                }
                if (filter.email) {
                    filterObj.email = { $regex: filter.email, $options: 'i' };
                }
                if (filter.accountType) {
                    filterObj.accountType = filter.accountType;
                }
                if (filter.isOnboarded) {
                    filterObj.isOnboarded = filter.isOnboarded === 'true';
                }
                if (filter.isBlocked) {
                    filterObj.isBlocked = filter.isBlocked === 'true';
                }
            }

            // Define the sorting logic
            const sortObj = {};
            if (sort) {
                if (sort.field === 'createdAt') {
                    sortObj.createdAt = sort.order === 'asc' ? 1 : -1;
                }
                if (sort.field === 'displayName') {
                    sortObj.displayName = sort.order === 'asc' ? 1 : -1;
                }
                if (sort.field === 'email') {
                    sortObj.email = sort.order === 'asc' ? 1 : -1;
                }
            } else {
                sortObj.createdAt = -1; // Default sorting
            }

            // Define the pagination logic
            const pageObj = {
                limit: parseInt(limit) || 10,
                skip: (parseInt(page) - 1) * parseInt(limit) || 0,
            };

            // Define the search logic
            const searchObj = search ? { $text: { $search: search } } : {};

            // Execute the query
            const users = await User.find({
                ...filterObj,
                ...searchObj,
            })
                .sort(sortObj)
                .skip(pageObj.skip)
                .limit(pageObj.limit)
                .exec();

            // Return the results
            return res.status(200).json({
                users,
                total: await User.countDocuments({ ...filterObj, ...searchObj }),
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Server error' });
        }
    });

router.get('/:id',
    ParamsValidation(validationSchemes.userValidationSchemas['/:id']),
    authenticateAdmin, async (req, res) => {
        try {
            const user = await User.findById(req.params.id);

            if (!user) return res.status(404).json({ message: 'User not found' });

            const safeUser = {
                _id: user._id,
                displayName: user.displayName,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                verified: user.verified,
                photoURL: user.photoURL,
                accountType: user.accountType,
                companyName: user.companyName,
                signInProvider: user.signInProvider,
                addresses: user.addresses,
                isBlocked: user.isBlocked,
                onboardingStep: user.onboardingStep,
                isOnboarded: user.isOnboarded,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };

            res.json({ user: safeUser });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

// PUT update user details except for payment methods, or any sensitive data.
router.put('/:id',
    ParamsBodyValidation(validationSchemes.userValidationSchemas['/:id'].put),
    authenticateAdmin, async (req, res) => {
        try {
            const userId = req.params.id;
            const { displayName, firstName, lastName, email, phoneNumber } = req.body;

            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Check if sensitive fields are being updated
            if (user.paymentMethods || user.legalEntity) return res.status(403).json({ message: 'You are not authorized to update sensitive data' });

            // Update user details
            user.displayName = displayName || user.displayName;
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.email = email || user.email;
            user.phoneNumber = phoneNumber || user.phoneNumber;

            // Save updated user details
            await user.save();

            res.json({ message: 'User details updated successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

// DELETE user profile
router.delete("/:id",
    ParamsValidation(validationSchemes.userValidationSchemas['/:id'].delete),
    authenticateAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid user ID" });

            const user = await User.findById(id);
            if (!user) return res.status(404).json({ error: "User not found" });

            // Soft Delete
            await User.updateOne({ _id: id }, { deleted: true });

            // Hard Delete
            await User.deleteOne(id);
            await Order.deleteMany({ userId: id });
            await Payment.deleteMany({ user: id });
            await Cart.deleteMany({ userId: id });

            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

module.exports = router;