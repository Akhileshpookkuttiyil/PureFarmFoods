// models/Seller.js
const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    organizationName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    countryCode: {
        type: String,
        required: true
    },
    bankDetails: {
        bankName: {
            type: String,
            required: true
        },
        accountNumber: {
            type: String,
            required: true
        },
        ifscCode: {
            type: String,
            required: true
        }
    },
    gstNumber: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        required: false
    }
});

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
