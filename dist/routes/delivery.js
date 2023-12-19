"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing express and its types
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Importing your custom middleware and controller functions
const isAuth_1 = require("../auth/isAuth");
const deliveryController_1 = require("../controllers/deliveryController");
// Implement the user routes:
router.post('/deliveries/add', deliveryController_1.addDelivery);
router.post('/delivery/pickup', deliveryController_1.pickupDelivery);
router.post('/deliveries/decrypt', deliveryController_1.decryptDeliveryDetails);
router.post('/deliveries/encrypt', isAuth_1.isUserAuth, async (req, res) => {
    await (0, deliveryController_1.encryptDeliveryDetails)(req, res);
});
router.post('/deliveries/ids', deliveryController_1.getDeliveryIds);
router.get('/deliveries/:trackingId/track', deliveryController_1.trackDelivery);
router.put('/deliveries/:deliverId/update', deliveryController_1.updateDelivery);
router.post('/deliveries/history/user', deliveryController_1.getUserDeliveryHistory);
router.put('/deliveries/history/partner', deliveryController_1.getPartnerDeliveryHistory);
router.post('/deliveries/handler/location', deliveryController_1.getHandlersLocation);
exports.default = router;
