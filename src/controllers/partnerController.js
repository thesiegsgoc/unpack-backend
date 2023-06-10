const Partner = require("../models/Partner");
const Delivery = require("../models/Delivery");
const db = require('../util/db');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotallySecretKey');

module.exports = {
    registerPartner: async (req, res) => {
        const { phonenumber, username, phone, password, confirm, location, expoPushToken, status} = req.body;
        if (!phonenumber || !status) {
            return res.json({ success: false, message: 'Fill out empty fields.' });
        } else {
            try {
                const phonenumberExists = await Partner.findOne({ phonenumber });

                if (phonenumberExists) {
                    return res.json({ success: false, message: 'The phone number is already registered by another user.' });
                }

                const newPartner = new Partner({
                    phonenumber,
                    status,
                    username,
                    password,
                    expoPushToken
                });
                await newPartner.save();
                return res.json({ success: true, data: newPartner });
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
        const partner = await Partner.findById({ _id: partnerId });

        if (!partner) {
            return res.json({ success: false, message: 'You do not have authorization to read this data.' });
        }
        const decryptedData = cryptr.decrypt(encryptedData);
        const pickupData = JSON.parse(JSON.parse(decryptedData));

        let deliveryIds = [];
        pickupData?.deliveries.forEach(async (data) => {
            const delivery = await Delivery.findById({ _id: data });
            if (delivery.currentHandler === partnerId) {
                deliveryIds.push(data);
            }
        });
        if (deliveryIds.length === 0) {
            return res.json({ success: false, message: 'You do not have any assigned packages to pick.' });
        }

        try {
            const userPartner = await Partner.findById({ _id: pickupData.access[0] });
            if (userPartner) {
                await db.partners.updateOne(
                { _id: pickupData.access[0] },
                {
                    $pull: {
                        deliveries: {
                            $each: deliveryIds
                        }
                    }
                }
            );
            }
            await db.partners.updateOne(
                { _id: partnerId },
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
                        },
                        $push: {
                        previousHandlers: {
                            $each: [ pickupData.access[0] ]
                        }
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