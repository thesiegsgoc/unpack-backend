"use strict";
// deliveryService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHandlersLocationService = exports.pickupDeliveryService = exports.getDeliveryIdsService = exports.getPartnerDeliveryHistoryService = exports.getUserDeliveryHistoryService = exports.trackDeliveryService = exports.encryptDeliveryDetailsService = exports.addDeliveryService = void 0;
const cryptr_1 = __importDefault(require("cryptr"));
const delivery_1 = __importDefault(require("../models/delivery"));
const user_1 = __importDefault(require("../models/users/user"));
const scheduling_1 = __importDefault(require("../util/scheduling"));
const db_1 = __importDefault(require("../util/db"));
const order_1 = __importDefault(require("../models/order"));
const partner_1 = __importDefault(require("../models/partner"));
const cryptr = new cryptr_1.default('myTotallySecretKey');
const addDeliveryService = async (deliveryData) => {
    const { receiver, phoneNumber, pickup, dropoff, sendorId, size, type, parcel, quantity, deliveryTime, deliveryDate, dropOffCost } = deliveryData;
    if (!quantity || !dropoff || !pickup) {
        throw new Error('Fill out empty fields.');
    }
    const numCurrentDeliveries = await db_1.default.deliveries.countDocuments();
    const handler = await scheduling_1.default.assignHandler(pickup);
    const newDelivery = new delivery_1.default({
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
    await newDelivery.save();
    await user_1.default.updateOne({ _id: sendorId }, { $push: { deliveries: [`D00${numCurrentDeliveries + 1}`] } });
    if (handler.success && handler.body.handler) {
        await user_1.default.updateOne({ _id: handler.body.handler }, { $push: { deliveries: [`D00${numCurrentDeliveries + 1}`] } });
    }
    return { trackingNumber: `D00${numCurrentDeliveries + 1}` };
};
exports.addDeliveryService = addDeliveryService;
const encryptDeliveryDetailsService = async (deliveryIds) => {
    if (!deliveryIds || deliveryIds.length === 0) {
        throw new Error('No delivery IDs provided.');
    }
    const deliveryDetails = [];
    await Promise.all(deliveryIds.map(async (deliveryId) => {
        const delivery = await delivery_1.default.findOne({ deliveryId });
        const user = delivery?.sendorId && await user_1.default.findOne({ userId: delivery.sendorId });
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
    const encryptedDetails = cryptr.encrypt(JSON.stringify({
        deliveryDetails,
        access: ['admin', ...deliveryIds, ...deliveryDetails.map((detail) => detail.shipper)],
    }));
    return encryptedDetails;
};
exports.encryptDeliveryDetailsService = encryptDeliveryDetailsService;
const trackDeliveryService = async (trackingId) => {
    const delivery = await db_1.default.deliveries.findOne({ deliveryId: trackingId });
    if (!delivery) {
        throw new Error('Provide a valid order ID.');
    }
    const { scheduledHandler, status, pickup, dropoff } = delivery;
    const handlerDetails = await user_1.default.findById(scheduledHandler);
    if (!handlerDetails) {
        throw new Error('Handler details not found.');
    }
    const { fullname, username, rating, profilePhoto } = handlerDetails;
    if (status.value === 'cancelled') {
        throw new Error('This order was cancelled. Cannot track it.');
    }
    if (status.value === 'delivered') {
        throw new Error('This order is already delivered. Cannot track it. Check your order history for more info.');
    }
    return { pickup, dropoff, handlerName: fullname || username, handlerRating: rating, handlerProfilePhoto: profilePhoto, scheduledHandler };
};
exports.trackDeliveryService = trackDeliveryService;
const getUserDeliveryHistoryService = async (userId) => {
    const user = await user_1.default.findById(userId).populate('deliveries');
    if (!user || !user.deliveries?.length) {
        throw new Error('User not found or has no delivery history.');
    }
    const deliveryList = [];
    for (const delivery of user.deliveries) {
        const deliveryItem = await delivery_1.default.findById(delivery);
        if (!deliveryItem) {
            console.error(`Delivery data missing for ID: ${delivery}`);
            continue;
        }
        const sender = await user_1.default.findById(deliveryItem.sendorId);
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
            // Additional details can be added here if needed
        });
    }
    return deliveryList;
};
exports.getUserDeliveryHistoryService = getUserDeliveryHistoryService;
const getPartnerDeliveryHistoryService = async (partnerId) => {
    const partner = await partner_1.default.findOne({ partnerId }).populate('deliveries');
    if (!partner || !partner.deliveries?.length) {
        throw new Error('Partner not found or has no delivery history.');
    }
    const deliveryList = [];
    for (const delivery of partner.deliveries) {
        const deliveryData = await delivery_1.default.findById(delivery);
        if (!deliveryData) {
            console.error(`Delivery data missing for ID: ${delivery}`);
            continue;
        }
        const orderData = await order_1.default.findById(deliveryData.orderId);
        const vendorData = await user_1.default.findById(deliveryData.vendorId);
        deliveryList.push({
            delivery: {
                pickup: deliveryData.pickup,
                dropoff: deliveryData.dropoff,
                time: deliveryData.deliveryTime,
                date: deliveryData.deliveryDate,
                status: deliveryData.status,
                deliveryId: deliveryData.id,
                type: deliveryData.type,
                receiver: deliveryData.receiver,
                sendor: deliveryData.sendorId,
                expoPushToken: vendorData?.expoPushToken,
                dropOffCost: deliveryData.dropOffCost,
                pickUpCost: deliveryData.pickUpCost,
                deliveryCost: deliveryData.deliveryCost,
                deliveryTime: deliveryData.deliveryTime // Include deliveryTime
            },
            order: {
                name: orderData?.name,
                parcel: orderData?.parcel,
                quantity: orderData?.quantity,
                size: orderData?.size,
            },
            vendor: {
                fullname: vendorData?.fullname || vendorData?.username,
                avatar: vendorData?.avatar,
            },
        });
    }
    return deliveryList;
};
exports.getPartnerDeliveryHistoryService = getPartnerDeliveryHistoryService;
const getDeliveryIdsService = async (userID) => {
    if (!userID) {
        throw new Error('Provide user ID.');
    }
    const user = await user_1.default.findById({ _id: userID });
    if (!user) {
        throw new Error('User not found.');
    }
    let deliveries = [];
    if (user.status === 'vendor' || user.status === 'consumer') {
        deliveries = await delivery_1.default.find({ "sendorId": userID }).exec();
    }
    // Include other conditions if necessary
    if (!deliveries || deliveries.length === 0) {
        throw new Error('No deliveries from the user.');
    }
    let deliveryIds = deliveries.map(delivery => delivery.deliveryId);
    const encryptedDeliveries = cryptr.encrypt(JSON.stringify({
        deliveryIds,
        access: [userID, 'admin']
    }));
    return encryptedDeliveries;
};
exports.getDeliveryIdsService = getDeliveryIdsService;
const pickupDeliveryService = async (encryptedData, partnerId) => {
    if (!partnerId) {
        throw new Error('Cannot be picked-up without a partner.');
    }
    if (!encryptedData) {
        throw new Error('Cannot decrypt undefined data.');
    }
    const partner = await user_1.default.findById({ _id: partnerId });
    if (!partner) {
        throw new Error('You do not have authorization to read this data.');
    }
    const decryptedData = cryptr.decrypt(encryptedData);
    const deliveryData = JSON.parse(decryptedData);
    if (deliveryData.length === 0) {
        return { success: true, message: 'No package to pick up.' };
    }
    let deliveryIds = [];
    for (const deliveryId of deliveryData.deliveryIds) {
        const delivery = await delivery_1.default.findOne({ deliveryId });
        if (delivery && delivery.scheduledHandler === partnerId) {
            await db_1.default.deliveries.updateOne({ deliveryId }, {
                $set: {
                    currentHandler: { id: partnerId, time: `${(new Date()).toISOString()}` },
                },
                $push: {
                    pickedUpFrom: { $each: [{ id: deliveryData.access[0], time: `${(new Date()).toISOString()}` }] }
                }
            });
            deliveryIds.push(deliveryId);
        }
    }
    return { success: true, deliveryIds, message: 'Package pickup process finished successfully.' };
};
exports.pickupDeliveryService = pickupDeliveryService;
const getHandlersLocationService = async (scheduledHandler) => {
    if (!scheduledHandler) {
        throw new Error('Provide valid handler id.');
    }
    const handler = await user_1.default.findById(scheduledHandler);
    if (!handler) {
        throw new Error('Handler does not exist.');
    }
    return handler.location;
};
exports.getHandlersLocationService = getHandlersLocationService;
