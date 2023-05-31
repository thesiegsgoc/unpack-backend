const Cryptr = require('cryptr');
const mongoose = require("mongoose");
const cryptr = new Cryptr('myTotallySecretKey');

// For now, it should be find to treat oderId as a
// tracking number as well. So, it should also be used
// in the PartnerSchema.
const PartnerSchema = new mongoose.Schema({
    partnerId: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    phonenumber: {
        type: String,
        required: true
    },
    location: {
        type: Object
    },
    verified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    deliveries: {
        type: Array,
        default: []
    },
    avatar: {
        type: Buffer
    },
    date: {
        type: Date,
        default: Date.now
    },
});

/**
 * This method encrypts the nida number that partner provides.
 * We do this to add security layer over that info since it is private.
 * 
 * PartnerSchema.pre('save', function(next) {
    if (this.isModified('nida')) {
        const encryptedNIDA = cryptr.encrypt(this.nida);
        this.nida = encryptedNIDA;
    }
    next();
});
 */

module.exports = mongoose.model("Partner", PartnerSchema);
