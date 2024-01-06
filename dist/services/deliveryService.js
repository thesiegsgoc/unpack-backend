"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeliveryStatus = exports.updateDriversLocationService = exports.deliveryCostService = exports.getHandlersLocationService = exports.pickupDeliveryService = exports.getDeliveryIdsService = exports.getPartnerDeliveryHistoryService = exports.getUserDeliveryHistoryService = exports.getAllDeliveriesService = exports.trackDeliveryService = exports.encryptDeliveryDetailsService = exports.updateDeliveryService = exports.createDeliveryService = void 0;
const cryptr_1 = __importDefault(require("cryptr"));
const Delivery_1 = __importDefault(require("../models/Delivery"));
const user_1 = __importDefault(require("../models/users/user"));
const scheduling_1 = __importDefault(require("../util/scheduling"));
const db_1 = __importDefault(require("../util/db"));
const Order_1 = __importDefault(require("../models/Order"));
const Partner_1 = __importDefault(require("../models/Partner"));
const websocketService_1 = __importDefault(require("../websocket/websocketService"));
const cryptr = new cryptr_1.default('myTotallySecretKey');
const createDeliveryService = async (deliveryData) => {
    const { receiver, phoneNumber, pickup, dropoffLocation, senderId, size, type, parcel, quantity, deliveryTime, deliveryDate, dropOffCost, } = deliveryData;
    const numCurrentDeliveries = await db_1.default.deliveries.countDocuments();
    const handler = await scheduling_1.default.assignHandler(pickup);
    const newDelivery = new Delivery_1.default({
        receiver,
        phoneNumber,
        pickup,
        dropoffLocation,
        senderId,
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
    await user_1.default.updateOne({ _id: senderId }, { $push: { deliveries: [`D00${numCurrentDeliveries + 1}`] } });
    if (handler.success && handler.body.handler) {
        await user_1.default.updateOne({ _id: handler.body.handler }, { $push: { deliveries: [`D00${numCurrentDeliveries + 1}`] } });
    }
    return { trackingNumber: `D00${numCurrentDeliveries + 1}` };
};
exports.createDeliveryService = createDeliveryService;
const updateDeliveryService = async (deliveryData) => {
    try {
        // Ensure the deliveryData includes the deliveryId
        const { deliveryId } = deliveryData;
        if (!deliveryId) {
            throw new Error('Delivery ID is required for updating.');
        }
        // Find the existing delivery record in the database
        const existingDelivery = await Delivery_1.default.findOne({ deliveryId });
        if (!existingDelivery) {
            throw new Error(`Delivery with ID ${deliveryId} not found.`);
        }
        // Update the existing delivery record with the new data
        const updatedDelivery = await Delivery_1.default.findOneAndUpdate({ deliveryId }, { $set: deliveryData }, { new: true } // Return the updated document
        );
        return updatedDelivery;
    }
    catch (error) {
        console.error('Error updating delivery:', error.message);
        throw error;
    }
};
exports.updateDeliveryService = updateDeliveryService;
const encryptDeliveryDetailsService = async (deliveryIds) => {
    if (!deliveryIds || deliveryIds.length === 0) {
        throw new Error('No delivery IDs provided.');
    }
    const deliveryDetails = [];
    await Promise.all(deliveryIds.map(async (deliveryId) => {
        const delivery = await Delivery_1.default.findOne({ deliveryId });
        const user = delivery?.senderId &&
            (await user_1.default.findOne({ userId: delivery.senderId }));
        if (!delivery || !user) {
            throw new Error(`Invalid delivery data for ID: ${deliveryId}`);
        }
        deliveryDetails.push({
            from: {
                phone: user.phone,
                email: user.email,
                pickup: delivery.pickupLocation,
            },
            to: {
                receiver: delivery.receiver,
                phonenumber: delivery.phoneNumber,
                dropoff: delivery.dropoffLocation,
            },
            shipper: delivery.scheduledHandler,
            notes: delivery.notes,
        });
    }));
    const encryptedDetails = cryptr.encrypt(JSON.stringify({
        deliveryDetails,
        access: [
            'admin',
            ...deliveryIds,
            ...deliveryDetails.map((detail) => detail.shipper),
        ],
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
    return {
        pickup,
        dropoff,
        handlerName: name,
        handlerRating: rating,
        handlerProfilePhoto: profilePhoto,
        scheduledHandler,
    };
};
exports.trackDeliveryService = trackDeliveryService;
const getAllDeliveriesService = async () => {
    try {
        const deliveries = await Delivery_1.default.find({});
        if (!deliveries || deliveries.length === 0) {
            throw new Error('No deliveries found.');
        }
        // Mapping the deliveries to return a simplified or specific structure
        // Modify this as per your application's requirements
        const mappedDeliveries = deliveries.map((delivery) => {
            return {
                deliveryId: delivery.deliveryId,
                senderId: delivery.senderId,
                receiver: delivery.receiver,
                status: delivery.status,
                scheduledHandler: delivery.scheduledHandler,
                pickupLocation: delivery.pickupLocation,
                dropoffLocation: delivery.dropoffLocation,
                deliveryTime: delivery.deliveryTime,
                deliveryDate: delivery.deliveryDate,
                // Add more fields as required
            };
        });
        return mappedDeliveries;
    }
    catch (error) {
        throw new Error(`Error fetching deliveries: ${error.message}`);
    }
};
exports.getAllDeliveriesService = getAllDeliveriesService;
const getUserDeliveryHistoryService = async (userId) => {
    const user = await user_1.default.findById(userId).populate('deliveries');
    if (!user || !user.deliveries?.length) {
        throw new Error('User not found or has no delivery history.');
    }
    const deliveryList = [];
    for (const delivery of user.deliveries) {
        const deliveryItem = await Delivery_1.default.findById(delivery);
        if (!deliveryItem) {
            console.error(`Delivery data missing for ID: ${delivery}`);
            continue;
        }
        const sender = await user_1.default.findById(deliveryItem.senderId);
        deliveryList.push({
            delivery: {
                pickup: deliveryItem.pickupLocation,
                dropoff: deliveryItem.dropoffLocation,
                time: deliveryItem.deliveryTime,
                date: deliveryItem.deliveryDate,
                status: deliveryItem.status,
                deliveryId: delivery,
                type: deliveryItem.type,
                receiver: deliveryItem.receiver,
                sendor: sender?.fullname,
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
    const partner = await Partner_1.default.findOne({ partnerId }).populate('deliveries');
    if (!partner || !partner.deliveries?.length) {
        throw new Error('Partner not found or has no delivery history.');
    }
    const deliveryList = [];
    for (const delivery of partner.deliveries) {
        const deliveryData = await Delivery_1.default.findById(delivery);
        if (!deliveryData) {
            console.error(`Delivery data missing for ID: ${delivery}`);
            continue;
        }
        const orderData = await Order_1.default.findById(deliveryData.orderId);
        const vendorData = await user_1.default.findById(deliveryData.vendorId);
        deliveryList.push({
            delivery: {
                pickup: deliveryData.pickupLocation,
                dropoff: deliveryData.dropoffLocation,
                time: deliveryData.deliveryTime,
                date: deliveryData.deliveryDate,
                status: deliveryData.status,
                deliveryId: deliveryData.id,
                type: deliveryData.type,
                receiver: deliveryData.receiver,
                sendor: deliveryData.senderId,
                expoPushToken: vendorData?.expoPushToken,
                dropOffCost: deliveryData.dropOffCost,
                pickUpCost: deliveryData.pickUpCost,
                deliveryCost: deliveryData.deliveryCost,
                deliveryTime: deliveryData.deliveryTime, // Include deliveryTime
            },
            order: {
                name: orderData?.name,
                parcel: orderData?.parcel,
                quantity: orderData?.quantity,
                size: orderData?.size,
            },
            vendor: {
                fullname: vendorData?.fullname,
                avatar: vendorData?.avatar,
            },
        });
    }
    return deliveryList;
};
exports.getPartnerDeliveryHistoryService = getPartnerDeliveryHistoryService;
const getDeliveryIdsService = async (userId) => {
    if (!userId) {
        throw new Error('Provide user ID.');
    }
    const user = await user_1.default.findById({ _id: userId });
    if (!user) {
        throw new Error('User not found.');
    }
    let deliveries = [];
    if (user.status === 'vendor' || user.status === 'consumer') {
        deliveries = await Delivery_1.default.find({ senderId: userId }).exec();
    }
    // Include other conditions if necessary
    if (!deliveries || deliveries.length === 0) {
        throw new Error('No deliveries from the user.');
    }
    let deliveryIds = deliveries.map((delivery) => delivery.deliveryId);
    const encryptedDeliveries = cryptr.encrypt(JSON.stringify({
        deliveryIds,
        access: [userId, 'admin'],
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
        const delivery = await Delivery_1.default.findOne({ deliveryId });
        if (delivery && delivery.scheduledHandler === partnerId) {
            await db_1.default.deliveries.updateOne({ deliveryId }, {
                $set: {
                    currentHandler: {
                        id: partnerId,
                        time: `${new Date().toISOString()}`,
                    },
                },
                $push: {
                    pickedUpFrom: {
                        $each: [
                            {
                                id: deliveryData.access[0],
                                time: `${new Date().toISOString()}`,
                            },
                        ],
                    },
                },
            });
            deliveryIds.push(deliveryId);
        }
    }
    return {
        success: true,
        deliveryIds,
        message: 'Package pickup process finished successfully.',
    };
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
const deliveryCostService = async (pickUpLocation, dropOffLocation, deliveryType) => {
    // const zones = await Zone.find({})
    // const pickUpCostDetails = getDeliveryCostDetails(zones, pickUpLocation)
    // const dropOffCostDetails = getDeliveryCostDetails(zones, dropOffLocation)
    // //@ts-ignore
    // const zoneToZoneKey = `${pickUpCostDetails.zoneName}-${dropOffCostDetails.zoneName}`
    // const interZoneCost = ZONE_TO_ZONE_COST[zoneToZoneKey] || 0
    // //@ts-ignore
    // const totalCost =
    //   pickUpCostDetails.cost + dropOffCostDetails.cost + interZoneCost
    // return {
    //   //@ts-ignore
    //   pickUpCost: pickUpCostDetails.cost,
    //   //@ts-ignore
    //   dropOffCost: dropOffCostDetails.cost,
    //   totalCost,
    // }
};
exports.deliveryCostService = deliveryCostService;
const updateDriversLocationService = async (driverId, location) => {
    // Update the driver's location in the database
    await Delivery_1.default.updateOne({ driverId }, { $set: { currentLocation: location } });
    // Use the WebSocket service to notify relevant users
    const webSocketService = websocketService_1.default.getInstance();
    webSocketService.updateDriverLocation(driverId, location);
};
exports.updateDriversLocationService = updateDriversLocationService;
//update delivery status once driver completed the session
const updateDeliveryStatus = async (req, res) => {
    const { sessionId } = req.body;
    const updatedSession = await Session.findByIdAndUpdate(sessionId, { status: 'completed', endTime: new Date() }, { new: true });
    res.status(200).json(updatedSession);
};
exports.updateDeliveryStatus = updateDeliveryStatus;
