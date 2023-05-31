const Partner = require("../models/Partner");
const db = require('../util/db');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotallySecretKey');

module.exports = {
    registerPartner: async (req, res) => {
        const { fullname, phonenumber, location, partnerId, rating, status, deliveries } = req.body;
        if (!fullname || !phonenumber || !location) {
            return res.json({ success: false, message: 'Fill out empty fields.' });
        } else {
            try {
                const phonenumberExists = await Partner.findOne({ phonenumber });

                if (phonenumberExists) {
                    return res.json({ success: false, message: 'The phone number is already registered by another user.' });
                }

                const newPartner = new Partner({
                    fullname,
                    phonenumber,
                    location,
                    partnerId,
                    rating,
                    status,
                    deliveries
                });
                await newPartner.save();
                return res.json({ status: 'OK', data: newPartner });
            } catch (error) {
                return res.json({ success: false, message: error.message });
            }
        }
    },

    updatePartnerInfo: async (req, res) => {
        const { partnerId } = req.body;
        try {
            await db.partners.updateOne(
                { partnerId },
                {
                    $set: {
                        ...req.body
                    }
                }
            );
            return res.json({ success: true, message: 'Partner info has updated successfully.' });
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    },

    encryptPickupData: (req, res) => {
        const { deliveries } = req.body;

        if (!deliveries) {
            return res.json({ success: false, message: 'Cannot encrypt empty deliveries.' });
        }

        const encryptedPartnerData = cryptr.encrypt(JSON.stringify(JSON.stringify(deliveries)));
        if (encryptedPartnerData) {
            return res.json({
                success: true,
                body: {
                    partnerIds: encryptedPartnerData
                },
                message: 'Partner\'s data encrypted successfully.'
            });
        } else {
            return res.json({ success: false, message: 'Partner\'s data not encrypted successfully.' });
        }
    },

    pickupPackage: async (req, res) => {
        const { encryptedData, partnerId } = req.body;
        if (!partnerId) {
            return res.json({ success: false, message: 'Cannot be picked-up without a partner.' });
        }

        if (!encryptedData) {
            return res.json({ success: false, message: 'Cannot decrypt undefined data.' });
        }

        const decryptedData = cryptr.decrypt(encryptedData);
        const pickupData = JSON.parse(JSON.parse(decryptedData));
        
        const deliveryItem = pickupData.filter(item => item.shippers === partnerId );
        if (!deliveryItem) {
            return res.json({ success: false, message: 'You do not have any assigned packages to pick.' });
        }
        const deliveryIds = deliveryItem[0].deliveries;
        try {
            await db.partners.updateOne(
                { partnerId },
                {
                    $push: {
                        deliveries: {
                            $each: deliveryIds
                        }
                    }
                }
            );
            deliveryIds.forEach(async (deliveryId, index) => {
                await db.deliveries.updateOne(
                    { deliveryId },
                    {
                        $set: {
                            currentHandler: partnerId
                        }
                    }
                );
                if (index === deliveryIds.length - 1) {
                    return await res.json({
                        success: true,
                        message: 'Package pickup process finished successfully.'
                    });
                }
            });
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }

    }
};