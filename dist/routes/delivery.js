"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing express and its types
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const deliveryController_1 = require("../controllers/deliveryController");
// Implement the user routes:
router.post('/deliveries/add', deliveryController_1.addDeliveryController);
router.post('/delivery/pickup', deliveryController_1.pickupDeliveryController);
router.post('/deliveries/decrypt', deliveryController_1.encryptDeliveryDetailsController);
// TODO: return the isUserAuth middleware to the route above as bellow
// router.post('/deliveries/encrypt', isUserAuth, async (req: RequestWithUser, res: Response) => {
//     await encryptDeliveryDetails(req, res);
// }); 
router.post('/deliveries/encrypt', async (req, res) => {
    await (0, deliveryController_1.encryptDeliveryDetailsController)(req, res);
});
router.post('/deliveries/ids', deliveryController_1.getDeliveryIdsController);
router.get('/deliveries/:trackingId/track', deliveryController_1.trackDeliveryController);
router.put('/deliveries/:deliverId/update', deliveryController_1.addDeliveryController);
router.post('/deliveries/history/user', deliveryController_1.getUserDeliveryHistoryController);
router.put('/deliveries/history/partner', deliveryController_1.getPartnerDeliveryHistoryController);
router.post('/deliveries/handler/location', deliveryController_1.getHandlersLocationController);
exports.default = router;
