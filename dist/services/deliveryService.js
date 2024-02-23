"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHandlersLocationService = exports.pickupDeliveryService = exports.getDeliveryIdsService = exports.getPartnerDeliveryHistoryService = exports.getUserDeliveryHistoryService = exports.getDeliveryByIdService = exports.getAllDeliveriesService = exports.trackDeliveryService = exports.encryptDeliveryDetailsService = exports.updateDeliveryService = exports.createDeliveryService = void 0;
const cryptr_1 = __importDefault(require("cryptr"));
const Delivery_1 = __importDefault(require("../models/Delivery"));
const user_1 = __importDefault(require("../models/users/user"));
const scheduling_1 = __importDefault(require("../util/scheduling"));
const db_1 = __importDefault(require("../util/db"));
const Order_1 = __importDefault(require("../models/Order"));
const Partner_1 = __importDefault(require("../models/Partner"));
const cryptr = new cryptr_1.default('myTotallySecretKey');
const createDeliveryService = async (deliveryData) => {
    const { receiver, phoneNumber, pickupLocation, dropoffLocation, userId, package_size, delivery_type, parcel, delivery_quantity, delivery_time, delivery_date, dropOffCost, delivery_cost, pickupZone, dropoffZone, } = deliveryData;
    const numCurrentDeliveries = await db_1.default.deliveries.countDocuments();
    const handler = await scheduling_1.default.assignHandler(pickupLocation);
    const newDelivery = new Delivery_1.default({
        receiver,
        phoneNumber,
        pickupLocation,
        dropoffLocation,
        userId,
        package_size,
        delivery_type,
        parcel,
        delivery_quantity,
        deliveryId: `D00${numCurrentDeliveries + 1}`,
        scheduled_handler: handler.success ? handler.body.handler : undefined,
        delivery_time,
        delivery_date,
        dropOffCost,
        delivery_cost,
        pickupZone,
        dropoffZone,
    });
    await newDelivery.save();
    await user_1.default.updateOne({ userId: userId }, { $push: { deliveries: [`D00${numCurrentDeliveries + 1}`] } });
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
        if (!updatedDelivery) {
            throw new Error(`Failed  to update delivery request`);
        }
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
        const user = delivery?.userId &&
            (await user_1.default.findOne({ userId: delivery.userId }));
        if (!delivery || !user) {
            throw new Error(`Invalid delivery data for ID: ${deliveryId}`);
        }
        deliveryDetails.push({
            from: {
                fullname: user.fullname,
                phone: user.phone,
                email: user.email,
                pickup: delivery.pickupLocation,
            },
            to: {
                receiver: delivery.receiver,
                phonenumber: delivery.phoneNumber,
                dropoff: delivery.dropoffLocation,
            },
            shipper: delivery.scheduled_handler,
            notes: delivery.delivery_notes,
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
    const { scheduled_handler, delivery_status, pickup, dropoff } = delivery;
    const handlerDetails = await user_1.default.findById(scheduled_handler);
    if (!handlerDetails) {
        throw new Error('Handler details not found.');
    }
    const { fullname, username, rating, profilePhoto } = handlerDetails;
    if (delivery_status.value === 'cancelled') {
        throw new Error('This order was cancelled. Cannot track it.');
    }
    if (delivery_status.value === 'delivered') {
        throw new Error('This order is already delivered. Cannot track it. Check your order history for more info.');
    }
    return {
        pickup,
        dropoff,
        handlerName: name,
        handlerRating: rating,
        handlerProfilePhoto: profilePhoto,
        scheduled_handler,
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
                ...delivery,
            };
        });
        return mappedDeliveries;
    }
    catch (error) {
        throw new Error(`Error fetching deliveries: ${error.message}`);
    }
};
exports.getAllDeliveriesService = getAllDeliveriesService;
const getDeliveryByIdService = async (deliveryId) => {
    try {
        const delivery = await Delivery_1.default.findOne({ deliveryId });
        if (!delivery) {
            throw new Error('No deliveries found.');
        }
        return delivery;
    }
    catch (errro) {
        throw new Error(`Error fetching delivery ${errro.message}`);
    }
};
exports.getDeliveryByIdService = getDeliveryByIdService;
const getUserDeliveryHistoryService = async (userId) => {
    // 'deliveries' is the correct field name that holds references to delivery documents.
    const user = await user_1.default.findById(userId).populate('deliveries');
    // Check if the user was found and has delivery history.
    if (!user || !user.deliveries?.length) {
        throw new Error('User not found or has no delivery history.');
    }
    const deliveryList = [];
    for (const deliveryId of user.deliveries) {
        const deliveryItem = await Delivery_1.default.findById(deliveryId);
        if (!deliveryItem) {
            console.error(`Delivery data missing for ID: ${deliveryId}`);
            continue;
        }
        // Adjust the spreading of deliveryItem based on actual structure and required fields.
        deliveryList.push({ ...deliveryItem });
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
                time: deliveryData.delivery_time,
                date: deliveryData.delivery_date,
                status: deliveryData.delivery_status,
                deliveryId: deliveryData.id,
                sender: deliveryData.id,
                type: deliveryData.delivery_type,
                receiver: deliveryData.receiver,
                expoPushToken: vendorData?.expoPushToken,
                dropOffCost: deliveryData.drop_off_cost,
                pickUpCost: deliveryData.pick_up_cost,
                deliveryCost: deliveryData.delivery_cost,
                deliveryTime: deliveryData.delivery_time, // Include delivery_time
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
        deliveries = await Delivery_1.default.find({ userId: userId }).exec();
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
        if (delivery && delivery.scheduled_handler === partnerId) {
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
const getHandlersLocationService = async (scheduled_handler) => {
    if (!scheduled_handler) {
        throw new Error('Provide valid handler id.');
    }
    const handler = await user_1.default.findById(scheduled_handler);
    if (!handler) {
        throw new Error('Handler does not exist.');
    }
    return handler.location;
};
exports.getHandlersLocationService = getHandlersLocationService;
