"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing express and its types
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const deliveryController_1 = require("../controllers/deliveryController");
// TODO: return the isUserAuth middleware to the route above as bellow
// router.post('/deliveries/encrypt', isUserAuth, async (req: RequestWithUser, res: Response) => {
//     await encryptDeliveryDetails(req, res);
// });
// Versioning and plural nouns
router.get('/deliveries', deliveryController_1.getAllDeliveriesController);
router.post('/deliveries/calculate-delivery-cost', deliveryController_1.calculateDeliveryCostController);
router.post('/deliveries/create', deliveryController_1.createDeliveryController);
router.post('/deliveries/pickup', deliveryController_1.pickupDeliveryController);
// router.post('/deliveries/decrypt', encryptDeliveryDetailsController)
// router.post('/deliveries/match-pickupto-delivery', () =>
//   console.log('match-pickupto-delivery')
// )
// Secure endpoint with isUserAuth middleware, isUserAuth,
router.post('/deliveries/encrypt', deliveryController_1.encryptDeliveryDetailsController);
router.post('/deliveries/ids', deliveryController_1.getDeliveryIdsController);
router.get('/deliveries/:trackingId/track', deliveryController_1.trackDeliveryController);
router.put('/deliveries/:deliverId/update', deliveryController_1.updateDeliveryController);
router.post('/deliveries/history/user', deliveryController_1.getUserDeliveryHistoryController);
router.put('/deliveries/history/partner', deliveryController_1.getPartnerDeliveryHistoryController);
router.post('/deliveries/handler/location', deliveryController_1.getHandlersLocationController);
router.post('/deliveries/:deliveryId', deliveryController_1.getDeliveryByIdController);
exports.default = router;
