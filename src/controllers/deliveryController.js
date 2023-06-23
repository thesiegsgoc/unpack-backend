
const Cryptr = require('cryptr');
const Delivery = require("../models/Delivery");
const cryptr = new Cryptr('myTotallySecretKey');
const db = require('../util/db');
const scheduling = require('../util/scheduling');
const User = require('../models/User');

module.exports = {
    addDelivery: async (req, res) => {
        const {
            receiver, phonenumber, pickup, dropoff,
            sendorId, size, type, parcel, notes, quantity, deliveryTime
         } = req.body;
        if (!quantity || !dropoff || !pickup) {
            return res.json({ success: false, message: 'Fill out empty fields.' });
        }
            try {
                const numCurrentDeliveries = await db.deliveries.countDocuments();
                const handler = await scheduling.assignHandler(pickup);
                const newDelivery = new Delivery({
                    receiver,
                    phonenumber,
                    pickup,
                    dropoff,
                    notes,
                    deliveryId: `D00${numCurrentDeliveries + 1}`,
                    sendorId,
                    size,
                    type,
                    parcel,
                    quantity,
                    scheduledHandler: handler.success && handler.body.handler? handler.body.handler : '6481003e050a57815f7be8f0',
                    deliveryTime
                });
                await newDelivery.save();
                await User.updateOne(
                    { _id: sendorId },
                    {
                       $push: {
                        deliveries: {
                            $each: [ `D00${numCurrentDeliveries + 1}` ]
                        }
                    }
                    }
                );
                return res.json({ 
                    success: true,
                    message: 'Delivery ordered successfully',
                    trackingNumber: `D00${numCurrentDeliveries + 1}`
                });
            } catch (error) {
                return res.json({ success: false, message: error.message });
            }
    },

    updateDelivery: async (req, res) => {
        const { deliveryId } = req.params;
        try {
            await db.deliveries.updateOne(
                { deliveryId },
                {
                    $set: {
                        ...req.body
                    }
                }
            );
            return res.json({ success: true, message: 'Delivery info has updated successfully.' });
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    },

    encryptDeliveryDetails: async (req, res) => {
        const { deliveryIds } = req.body;
        try {
            if (!deliveryIds) {

            }
            let deliveryDetail = [];
            deliveryIds.forEach(async (deliveryId, index) => {
                const {
                    vendorId,
                    pickup,
                    dropoff,
                    receiver,
                    notes,
                    phonenumber,
                    currentHandler
                } = await db.deliveries.findOne({ deliveryId });
                const {
                    fullname,
                    phone,
                    email
                } = await db.users.findOne({ userId: vendorId });

                deliveryDetail.push({
                    from: {
                        fullname,
                        phone,
                        email,
                        pickup,
                    },
                    to: {
                        receiver,
                        phonenumber,
                        dropoff
                    },
                    shipper: currentHandler,
                    notes
                });
                if (index === deliveryIds.length - 1) {
                    const encryptedDetails = cryptr.encrypt(JSON.stringify({
                        deliveryDetail,
                        access: [vendorId, currentHandler, 'admin']
                    }));
                    return res.json({
                        success: true,
                        body: encryptedDetails,
                        message: 'Delivery details has been encrypted successfully.'
                    });
                }
            })
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    },

    decryptDeliveryDetails: (req, res) => {
        const { encryptedDetails, user } = req.body;
        if (!encryptedDetails) {
            return res.json({ success: false, message: 'There are no any packages to be picked.' });
        }

        const decryptedDetails = cryptr.decrypt(encryptedDetails);
        const deliveryDetails = JSON.parse(decryptedDetails);
        if (deliveryDetails && deliveryDetails.access && deliveryDetails.access.includes(user)) {
            return res.json({
                success: true,
                body: deliveryDetails,
                message: 'Delivery details decrypted successfully.'
            });
        } else {
            return res.json({ success: false, message: 'You do not have access to this data. Contact admin through 0713444777.' });
        }

    },

    trackDelivery: async (req, res) => {
        const { trackingId } = req.params;
        try {
            // The findOne method is used here because, by definition,
            // an order, with a unique ID, is executed by one and only one
            // delivery request.
            const delivery = await db.deliveries.findOne({ deliveryId: trackingId });
            if (!delivery) {
                return res.json({ success: false, message: 'Provide a valid order ID.' });
            }

            const { scheduledHandler, status, pickup, dropoff } = delivery;
            const { fullname, username, rating, profilePhoto } = await User.findById(scheduledHandler);
            if (status.value === 'cancelled') {
                return res.json({
                    success: false,
                    body: { status },
                    message: 'This order was cancelled. Cannot track it.'
                })
            }

            if (status.value === 'delivered') {
                return res.json({
                    success: false,
                    body: { status },
                    message: 'This order is already delivered. Cannot track it. Check your order history for more info.'
                })
            }

            return res.json({
                success: true,
                body: { pickup, dropoff, fullname: fullname || username, rating, profilePhoto },
                message: 'Tracking details retrieved successfully.'
            });
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    },

    getUserDeliveryHistory: async (req, res) => {
        const { userId } = req.body;
        try {
            const { deliveries } = await User.findById({ _id: userId });
            if (!deliveries) {
                return res.json({
                    success: false,
                    message: 'Provide a valid user ID.'
                });
            }
            let deliveryList = [];
            deliveries.forEach(async (delivery, index) => {
                const {
                    pickup,
                    dropoff,
                    deliveryTime,
                    status,
                    currentHandler
                } = await Delivery.findOne({ deliveryId: delivery });
                // const {
                //     fullname,
                //     location,
                //     rating,
                //     avatar
                // } = await db.users.findOne({ _id: currentHandler });

                deliveryList.push({
                    delivery: {
                        //pickup,
                        //dropoff,
                        deliveryTime,
                        status,
                        deliveryId: delivery
                    },
                    // partner: {
                    //     fullname,
                    //     location,
                    //     rating,
                    //     avatar
                    // }
                });

                if (index === deliveries.length - 1) {
                    return await res.json({
                success: true,
                body: JSON.stringify(deliveryList),
                message: 'User\'s delivery history retrieved successfully.'
            });
                }
            });
            
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    },

    getPartnerDeliveryHistory: async (req, res) => {
        const { partnerId } = req.body;
        try {
            const { deliveries } = await db.partners.findOne({ partnerId });
            if (!deliveries) {
                return res.json({ success: false, message: 'Provide a valid user ID.' });
            }

            let deliveryList = [];
            deliveryIds.forEach(async (deliveryId) => {
                const {
                    orderId,
                    pickup,
                    dropoff,
                    deliveryTime,
                    status,
                    vendorId
                } = await db.deliveries.findOne({ deliveryId });
                const {
                    name,
                    parcel,
                    quantity,
                    size
                } = await db.orders.findOne({ orderId });
                const {
                    fullname,
                    avatar
                } = await db.users.findOne({ userId: vendorId });

                deliveryList.push({
                    delivery: {
                        pickup,
                        dropoff,
                        deliveryTime,
                        status,
                    },
                    order: {
                        name,
                        parcel,
                        quantity,
                        size
                    },
                    vendor: {
                        fullname,
                        avatar
                    }
                });
                if (index === deliveries.length - 1) {
                    return res.json({
                        success: true,
                        body: deliveryList,
                        message: 'Delivery history retrieved successfully.'
                    });
                }
            });
            return res.json({
                success: true,
                body: { deliveryList },
                message: 'Delivery history retrieved successfully.'
            });
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    },

    getDeliveryIds: async (req, res) => {
        const { userID } = req.body;
       try {
            if (!userID) {
            return res.json({ success: false, message: 'Provide user ID.' })
        }
        const { status } = await User.findById({ _id: userID });
        let deliveries;
        if (status === 'vendor' || status === 'consumer') {
            deliveries =  await Delivery.find(
                { "sendorId" : userID }
            ).exec();
        }
        // else if (status === 'driver' || status === 'cpp') {
        //     deliveries =  await Delivery.find(
        //         { scheduledHandler : { userID } }
        //     )
        // }


        if (!deliveries) {
            return res.json({ success: false, message: 'No deliveries from the user.' })
        }
        let deliveryIds = [];
        deliveries.forEach((delivery) => {
            deliveryIds.push(delivery.deliveryId)
        })
        const encryptedDeliveries = cryptr.encrypt(JSON.stringify({
            deliveryIds,
            access: [userID, 'admin']
        }));
        return res.json({
            success: true,
            body: encryptedDeliveries,
            message: 'Delivery details has been encrypted successfully.'
        });
       } catch (error) {
           return res.json({ success: false, message: error.message });
       }

    },

    pickupDelivery: async (req, res) => {
        const { encryptedData, partnerId } = req.body;
        if (!partnerId) {
            return res.json({ success: false, message: 'Cannot be picked-up without a partner.' });
        }

        if (!encryptedData) {
            return res.json({ success: false, message: 'Cannot decrypt undefined data.' });
        }
        const partner = await User.findById({ _id: partnerId });

        if (!partner) {
            return res.json({ success: false, message: 'You do not have authorization to read this data.' });
        }
        const decryptedData = cryptr.decrypt(encryptedData);
        const deliveryData = JSON.parse(decryptedData);
    
        let deliveryIds = [];
        try {
            deliveryData?.deliveryIds.forEach(async (deliveryId, index) => {
            const delivery = await Delivery.findOne({ deliveryId });
            
            if (delivery.scheduledHandler === partnerId) {
                await db.deliveries.updateOne(
                    { deliveryId },
                    {
                        $set: {
                            currentHandler: { id: partnerId, time: `${(new Date(Date.now())).toString()}`},
                            //scheduledHandler: undefined,
                        },
                        $push: {
                        pickedUpFrom: {
                            $each: [ {id: deliveryData.access[0], time: `${(new Date(Date.now())).toString()}`} ]
                        }
                    }
                    }
                );
                deliveryIds.push(deliveryId); 
                if (index === deliveryIds.length - 1) {
                    return res.json({
                        success: true,
                        message: 'Package pickup process finished successfully.'
                    });
                }
            }

        });
        // if (deliveryIds.length === 0) {
        //     return res.json({ success: false, message: 'You do not have any assigned packages to pick.' });
        // } 
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }

        // try {
        //     const userPartner = await Partner.findById({ _id: deliveryData.access[0] });
        //     if (userPartner) {
        //         await db.users.updateOne(
        //         { _id: deliveryData.access[0] },
        //         {
        //             $pull: {
        //                 deliveries: {
        //                     $each: deliveryIds
        //                 }
        //             }
        //         }
        //     );
        //     }
        //     await db.partners.updateOne(
        //         { _id: partnerId },
        //         {
        //             $push: {
        //                 deliveries: {
        //                     $each: deliveryIds
        //                 }
        //             }
        //         }
        //     );
        //     deliveryIds.forEach(async (deliveryId, index) => {
        //         await db.deliveries.updateOne(
        //             { deliveryId },
        //             {
        //                 $set: {
        //                     currentHandler: partnerId
        //                 },
        //                 $push: {
        //                 previousHandlers: {
        //                     $each: [ deliveryData.access[0] ]
        //                 }
        //             }
        //             }
        //         );
        //         if (index === deliveryIds.length - 1) {
        //             return await res.json({
        //                 success: true,
        //                 message: 'Package pickup process finished successfully.'
        //             });
        //         }
        //     });
        // } catch (error) {
        //     return res.json({ success: false, message: error.message });
        // }

    }
};