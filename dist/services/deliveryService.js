"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeliveryStatus = exports.updateDriversLocationService = exports.deliveryCostService = exports.getHandlersLocationService = exports.pickupDeliveryService = exports.getDeliveryIdsService = exports.getUserDeliveryHistoryService = exports.getAllDeliveriesService = exports.trackDeliveryService = exports.encryptDeliveryDetailsService = exports.updateDeliveryService = exports.updateDeliveryOrderStatusService = exports.createDeliveryOrderService = void 0;
const cryptr_1 = __importDefault(require("cryptr"));
const user_1 = __importDefault(require("../models/users/user"));
const db_1 = __importDefault(require("../util/db"));
const websocketService_1 = __importDefault(require("../websocket/websocketService"));
const DeliveryOrderSchemal_1 = __importDefault(require("../models/DeliveryOrderSchemal"));
const cryptr = new cryptr_1.default('myTotallySecretKey');
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["Pending"] = "Pending";
    DeliveryStatus["Accepted"] = "Accepted";
    DeliveryStatus["InTransit"] = "In Transit";
    DeliveryStatus["Delivered"] = "Delivered";
    DeliveryStatus["Cancelled"] = "Cancelled";
})(DeliveryStatus || (DeliveryStatus = {}));
const createDeliveryOrderService = async (deliveryOrderData) => {
    try {
        const numbCurrentDeliveries = await db_1.default.deliveries.countDocuments();
        // Create a new delivery order
        const newDeliveryOrder = new DeliveryOrderSchemal_1.default({
            ...deliveryOrderData,
            deliveryId: `D00${numbCurrentDeliveries + 1}`,
            status: 'pending',
        });
        // Save the delivery order to the database
        const savedDeliveryOrder = await newDeliveryOrder.save();
        // Return the saved delivery order
        return savedDeliveryOrder;
    }
    catch (error) {
        console.error('Error creating delivery order:', error.message);
        throw error;
    }
};
exports.createDeliveryOrderService = createDeliveryOrderService;
const updateDeliveryOrderStatusService = async (deliveryId, newStatus, // Assuming this comes as a string
driverID) => {
    try {
        const delivery = await DeliveryOrderSchemal_1.default.findOne({ deliveryId });
        if (!delivery || !delivery.status) {
            throw new Error(`Delivery with ID ${deliveryId} not found or status is undefined.`);
        }
        // Update status and driverId
        delivery.status = {
            value: newStatus,
            updatedAt: new Date(),
        };
        delivery.driverId = driverID;
        await delivery.save();
        return delivery;
    }
    catch (error) {
        console.error('Error updating delivery status:', error.message);
        throw error;
    }
};
exports.updateDeliveryOrderStatusService = updateDeliveryOrderStatusService;
const updateDeliveryService = async (deliveryData) => {
    try {
        // Ensure the deliveryData includes the deliveryId
        const { deliveryId } = deliveryData;
        if (!deliveryId) {
            throw new Error('Delivery ID is required for updating.');
        }
        // Find the existing delivery record in the database
        const existingDelivery = await DeliveryOrderSchemal_1.default.findOne({ deliveryId });
        if (!existingDelivery) {
            throw new Error(`Delivery with ID ${deliveryId} not found.`);
        }
        // Update the existing delivery record with the new data
        const updatedDelivery = await DeliveryOrderSchemal_1.default.findOneAndUpdate({ deliveryId }, { $set: deliveryData }, { new: true } // Return the updated document
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
        const delivery = await DeliveryOrderSchemal_1.default.findById(deliveryId)
            .populate('senderId')
            .populate('receiverId')
            .populate('scheduledDriver');
        if (!delivery) {
            throw new Error(`Invalid delivery data for ID: ${deliveryId}`);
        }
        const sender = delivery.senderId; // Assuming IUser is the user interface
        const receiver = delivery.receiverId; // Similarly for receiver
        // deliveryDetails.push({
        //   from: {
        //     phone: sender.phone,
        //     email: sender.email,
        //     pickup: delivery.pickupLocation,
        //   },
        //   to: {
        //     receiver: receiver.fullname,
        //     phonenumber: receiver.phone,
        //     dropoff: delivery.dropoffLocation,
        //   },
        //   shipper: delivery.scheduledDriver.toString(),
        //   notes: delivery.notes,
        // })
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
    const delivery = await DeliveryOrderSchemal_1.default.findOne({
        deliveryId: trackingId,
    });
    if (!delivery) {
        throw new Error('Provide a valid order ID.');
    }
    const { driverId, status, pickupLocation, dropoffLocation } = delivery;
    const handlerDetails = await user_1.default.findById(driverId);
    if (!handlerDetails) {
        throw new Error('Handler details not found.');
    }
    const { fullname, rating, profilePhoto } = handlerDetails; // assuming these fields exist in your user model
    // Check the delivery status
    if (status?.value === 'cancelled') {
        throw new Error('This order was cancelled. Cannot track it.');
    }
    if (status?.value === 'delivered') {
        throw new Error('This order is already delivered. Cannot track it. Check your order history for more info.');
    }
    return {
        pickupLocation,
        dropoffLocation,
        handlerName: fullname,
        handlerRating: rating,
        handlerProfilePhoto: profilePhoto,
        driverId,
    };
};
exports.trackDeliveryService = trackDeliveryService;
const getAllDeliveriesService = async () => {
    try {
        const deliveries = await DeliveryOrderSchemal_1.default.find({});
        if (!deliveries || deliveries.length === 0) {
            throw new Error('No deliveries found.');
        }
        // Mapping the deliveries to return a simplified or specific structure
        const mappedDeliveries = deliveries.map((delivery) => {
            return {
                deliveryId: delivery.deliveryId,
                senderId: delivery.senderId,
                receiverId: delivery.receiverId,
                scheduledDriver: delivery.driverId,
                packageSize: delivery.packageSize,
                quantity: delivery.quantity,
                type: delivery.type,
                parcel: delivery.parcel,
                dropoffLocation: delivery.dropoffLocation,
                pickupLocation: delivery.pickupLocation,
                currentHandler: delivery.currentHandler,
                pickupDate: delivery.pickupDate,
                deliveryDate: delivery.deliveryDate,
                dropOffCost: delivery.dropOffCost,
                pickUpCost: delivery.pickUpCost,
                deliveryCost: delivery.deliveryCost,
                name: delivery.name,
                notes: delivery.notes,
                status: delivery.status,
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
    for (const deliveryId of user.deliveries) {
        const deliveryItem = await DeliveryOrderSchemal_1.default.findById(deliveryId);
        if (!deliveryItem) {
            console.error(`Delivery data missing for ID: ${deliveryId}`);
            continue;
        }
        const sender = await user_1.default.findById(deliveryItem.senderId);
        // deliveryList.push({
        //   deliveryId: deliveryItem.deliveryId,
        //   receiverId: deliveryItem.receiverId,
        //   senderId: deliveryItem.senderId,
        //   scheduledDriver: deliveryItem.scheduledDriver,
        //   packageSize: deliveryItem.packageSize,
        //   quantity: deliveryItem.quantity,
        //   type: deliveryItem.type,
        //   parcel: deliveryItem.parcel,
        //   dropoffLocation: deliveryItem.dropoffLocation,
        //   pickupLocation: deliveryItem.pickupLocation,
        //   currentHandler: deliveryItem.currentHandler,
        //   pickupDate: deliveryItem.pickupDate,
        //   deliveryDate: deliveryItem.deliveryDate,
        //   dropOffCost: deliveryItem.dropOffCost,
        //   pickUpCost: deliveryItem.pickUpCost,
        //   deliveryCost: deliveryItem.deliveryCost,
        //   name: deliveryItem.name,
        //   notes: deliveryItem.notes,
        //   status: deliveryItem.status,
        //   // Additional fields from IDeliveryOrder
        //   senderInfo: sender
        //     ? {
        //         fullname: sender.fullname,
        //         expoPushToken: sender.expoPushToken,
        //       }
        //     : undefined,
        // })
    }
    return deliveryList;
};
exports.getUserDeliveryHistoryService = getUserDeliveryHistoryService;
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
        deliveries = await DeliveryOrderSchemal_1.default.find({ senderId: userId }).exec();
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
    // let deliveryIds = []
    // for (const deliveryId of deliveryData.deliveryIds) {
    //   const delivery = await DeliveryModel.findOne({ deliveryId })
    //   if (delivery && delivery.scheduledHandler === partnerId) {
    //     await db.deliveries.updateOne(
    //       { deliveryId },
    //       {
    //         $set: {
    //           currentHandler: {
    //             id: partnerId,
    //             time: `${new Date().toISOString()}`,
    //           },
    //         },
    //         $push: {
    //           pickedUpFrom: {
    //             $each: [
    //               {
    //                 id: deliveryData.access[0],
    //                 time: `${new Date().toISOString()}`,
    //               },
    //             ],
    //           },
    //         },
    //       }
    //     )
    //     deliveryIds.push(deliveryId)
    //   }
    // }
    return {
        success: true,
        // deliveryIds,
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
    await DeliveryOrderSchemal_1.default.updateOne({ driverId }, { $set: { currentLocation: location } });
    // Use the WebSocket service to notify relevant users
    const webSocketService = websocketService_1.default.getInstance();
    webSocketService.updateDriverLocation(driverId, location);
};
exports.updateDriversLocationService = updateDriversLocationService;
//update delivery status once driver completed the session
const updateDeliveryStatus = async (req, res) => {
    const { sessionId } = req.body;
    const updatedSession = await DeliveryOrderSchemal_1.default.findByIdAndUpdate(sessionId, { status: 'completed', endTime: new Date() }, { new: true });
    res.status(200).json(updatedSession);
};
exports.updateDeliveryStatus = updateDeliveryStatus;
