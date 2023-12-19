"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHandlersLocation = exports.pickupDelivery = exports.getDeliveryIds = exports.getPartnerDeliveryHistory = exports.getUserDeliveryHistory = exports.trackDelivery = exports.encryptDeliveryDetails = exports.addDelivery = void 0;
const cryptr_1 = __importDefault(require("cryptr"));
const Delivery_1 = __importDefault(require("../models/Delivery"));
const User_1 = __importDefault(require("../models/User"));
const scheduling_1 = __importDefault(require("../util/scheduling"));
const db_1 = __importDefault(require("../util/db"));
const PartnerModel_1 = require("../models/PartnerModel");
const Order_1 = __importDefault(require("../models/Order"));
const cryptr = new cryptr_1.default('myTotallySecretKey');
const addDelivery = async (req, res) => {
    const { receiver, phoneNumber, pickup, dropoff, sendorId, size, type, parcel, quantity, deliveryTime, deliveryDate, dropOffCost } = req.body;
    // Throw error if mandatory fields are missing
    if (!quantity || !dropoff || !pickup) {
        return res.json({ success: false, message: 'Fill out empty fields.' });
    }
    try {
        // Get current number of deliveries and assign handler
        const numCurrentDeliveries = await db_1.default.deliveries.countDocuments();
        const handler = await scheduling_1.default.assignHandler(pickup);
        // Create new delivery object
        const newDelivery = new Delivery_1.default({
            receiver,
            phoneNumber,
            pickup,
            dropoff,
            sendorId,
            size,
            type,
            parcel,
            quantity,
            deliveryId: `D00${numCurrentDeliveries + 1}`,
            scheduledHandler: handler.success ? handler.body.handler : undefined,
            deliveryTime,
            deliveryDate,
            dropOffCost,
        });
        // Save delivery and update sender and handler user data
        await newDelivery.save();
        await User.updateOne({ _id: sendorId }, { $push: { deliveries: [`D00${numCurrentDeliveries + 1}`] } });
        if (handler.success && handler.body.handler) {
            await User.updateOne({ _id: handler.body.handler }, { $push: { deliveries: [`D00${numCurrentDeliveries + 1}`] } });
        }
        // Return success response with tracking number
        return res.json({
            success: true,
            message: 'Delivery ordered successfully',
            trackingNumber: `D00${numCurrentDeliveries + 1}`,
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.addDelivery = addDelivery;
const encryptDeliveryDetails = async (req, res) => {
    const { deliveryIds } = req.body;
    if (!deliveryIds || deliveryIds.length === 0) {
        return res.json({ success: false, message: 'No delivery IDs provided.' });
    }
    try {
        const deliveryDetails = [];
        // Retrieve details for each delivery ID
        await Promise.all(deliveryIds.map(async (deliveryId) => {
            const delivery = await Delivery_1.default.findOne({ deliveryId });
            const user = delivery?.sendorId && await User_1.default.findOne({ userId: delivery.sendorId });
            if (!delivery || !user) {
                throw new Error(`Invalid delivery data for ID: ${deliveryId}`);
            }
            deliveryDetails.push({
                from: {
                    fullname: user.fullname,
                    phone: user.phone,
                    email: user.email,
                    pickup: delivery.pickup,
                },
                to: {
                    receiver: delivery.receiver,
                    phonenumber: delivery.phoneNumber,
                    dropoff: delivery.dropoff,
                },
                shipper: delivery.scheduledHandler,
                notes: delivery.notes,
            });
        }));
        // Encrypt details with access restriction
        const encryptedDetails = cryptr.encrypt(JSON.stringify({
            deliveryDetails,
            access: ['admin', ...deliveryIds, ...deliveryDetails.map((detail) => detail.shipper)],
        }));
        return res.json({
            success: true,
            body: encryptedDetails,
            message: 'Delivery details have been encrypted successfully.',
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.encryptDeliveryDetails = encryptDeliveryDetails;
const trackDelivery = async (req, res) => {
    const { trackingId } = req.params;
    try {
        // The findOne method is used here because, by definition,
        // an order, with a unique ID, is executed by one and only one
        // delivery request.
        const delivery = await db_1.default.deliveries.findOne({ deliveryId: trackingId });
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
            });
        }
        if (status.value === 'delivered') {
            return res.json({
                success: false,
                body: { status },
                message: 'This order is already delivered. Cannot track it. Check your order history for more info.'
            });
        }
        return res.json({
            success: true,
            body: { pickup, dropoff, fullname: fullname || username, rating, profilePhoto, scheduledHandler },
            message: 'Tracking details retrieved successfully.'
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.trackDelivery = trackDelivery;
const getUserDeliveryHistory = async (req, res) => {
    const { userId } = req.body;
    try {
        // Look up user deliveries
        const user = await User_1.default.findById(userId).populate('deliveries');
        if (!user || !user.deliveries?.length) {
            return res.json({ success: false, message: 'User not found or has no delivery history.' });
        }
        // Prepare delivery list
        const deliveryList = [];
        // Process each delivery and populate details
        for (const delivery of user.deliveries) {
            const deliveryItem = await Delivery_1.default.findById(delivery);
            if (!deliveryItem) {
                // Handle missing delivery data (log and continue)
                console.error(`Delivery data missing for ID: ${delivery}`);
                continue;
            }
            const sender = await User_1.default.findById(deliveryItem.sendorId);
            deliveryList.push({
                delivery: {
                    pickup: deliveryItem.pickup,
                    dropoff: deliveryItem.dropoff,
                    time: deliveryItem.deliveryTime,
                    date: deliveryItem.deliveryDate,
                    status: deliveryItem.status,
                    deliveryId: delivery,
                    type: deliveryItem.type,
                    receiver: deliveryItem.receiver,
                    sendor: sender?.fullname || sender?.username,
                    expoPushToken: sender?.expoPushToken,
                    dropOffCost: deliveryItem.dropOffCost,
                    pickUpCost: deliveryItem.pickUpCost,
                    deliveryCost: deliveryItem.deliveryCost,
                },
                // TODO: Implement partner details retrieval and inclusion
                // partner: { ...partner details... },
            });
        }
        return res.json({ success: true, body: deliveryList, message: 'User\'s delivery history retrieved successfully.' });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.getUserDeliveryHistory = getUserDeliveryHistory;
const getPartnerDeliveryHistory = async (req, res) => {
    const { partnerId } = req.body;
    try {
        // Look up partner deliveries
        const partner = await PartnerModel_1.PartnerModel.findOne({ partnerId }).populate('deliveries');
        if (!partner || !partner.deliveries.length) {
            return res.json({ success: false, message: 'Partner not found or has no delivery history.' });
        }
        // Prepare delivery list
        const deliveryList = [];
        // Process each delivery and fetch details
        for (const delivery of partner.deliveries) {
            const deliveryData = await Delivery_1.default.findById(delivery);
            if (!deliveryData) {
                console.error(`Delivery data missing for ID: ${delivery}`);
                continue;
            }
            const orderData = await Order_1.default.findById(deliveryData.orderId);
            if (!orderData) {
                console.error(`Order data missing for ID: ${deliveryData.orderId}`);
                continue;
            }
            const vendorData = await User_1.default.findById(deliveryData.vendorId);
            deliveryList.push({
                delivery: {
                    pickup: deliveryData.pickup,
                    dropoff: deliveryData.dropoff,
                    deliveryTime: deliveryData.deliveryTime,
                    status: deliveryData.status,
                },
                order: {
                    name: orderData.name,
                    parcel: orderData.parcel,
                    quantity: orderData.quantity,
                    size: orderData.size,
                },
                vendor: {
                    fullname: vendorData?.fullname || vendorData?.username,
                    avatar: vendorData?.avatar,
                },
            });
        }
        return res.json({ success: true, body: deliveryList, message: 'Delivery history retrieved successfully.' });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.getPartnerDeliveryHistory = getPartnerDeliveryHistory;
const getDeliveryIds = async (req, res) => {
    const { userID } = req.body;
    try {
        if (!userID) {
            return res.json({ success: false, message: 'Provide user ID.' });
        }
        const { status } = await User.findById({ _id: userID });
        let deliveries;
        if (status === 'vendor' || status === 'consumer') {
            deliveries = await Delivery.find({ "sendorId": userID }).exec();
        }
        // else if (status === 'driver' || status === 'cpp') {
        //     deliveries =  await Delivery.find(
        //         { scheduledHandler : { userID } }
        //     )
        // }
        if (!deliveries) {
            return res.json({ success: false, message: 'No deliveries from the user.' });
        }
        let deliveryIds = [];
        deliveries.forEach((delivery) => {
            deliveryIds.push(delivery.deliveryId);
        });
        const encryptedDeliveries = cryptr.encrypt(JSON.stringify({
            deliveryIds,
            access: [userID, 'admin']
        }));
        return res.json({
            success: true,
            body: encryptedDeliveries,
            message: 'Delivery details has been encrypted successfully.'
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.getDeliveryIds = getDeliveryIds;
const pickupDelivery = async (req, res) => {
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
    if (deliveryData.length === 0) {
        return res.json({
            success: true,
            message: 'No package to pick up.'
        });
    }
    try {
        deliveryData?.deliveryIds.forEach(async (deliveryId, index) => {
            const delivery = await Delivery.findOne({ deliveryId });
            if (delivery.scheduledHandler === partnerId) {
                await db_1.default.deliveries.updateOne({ deliveryId }, {
                    $set: {
                        currentHandler: { id: partnerId, time: `${(new Date(Date.now())).toString()}` },
                    },
                    $push: {
                        pickedUpFrom: {
                            $each: [{ id: deliveryData.access[0], time: `${(new Date(Date.now())).toString()}` }]
                        }
                    }
                });
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
    }
    catch (error) {
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
};
exports.pickupDelivery = pickupDelivery;
const getHandlersLocation = async (req, res) => {
    const { scheduledHandler } = req.body;
    try {
        if (!scheduledHandler) {
            return res.json({ success: false, message: 'Provide valid handler id.' });
        }
        const handler = await User.findById(scheduledHandler);
        if (handler) {
            return res.json({
                success: true,
                body: { handlerLocation: handler.location },
                message: 'Handlers location retrieved successfully.'
            });
        }
        else {
            return res.json({ success: false, message: 'Handler does not exist.' });
        }
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.getHandlersLocation = getHandlersLocation;
