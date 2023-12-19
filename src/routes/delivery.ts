// Importing express and its types
import express, { Request, Response } from 'express';
const router = express.Router();

// Importing your custom middleware and controller functions
import { isUserAuth } from '../auth/isAuth';
import { 
    addDelivery,
    trackDelivery,
    updateDelivery,
    getUserDeliveryHistory,
    encryptDeliveryDetails,
    decryptDeliveryDetails,
    getPartnerDeliveryHistory,
    getDeliveryIds,
    pickupDelivery,
    getHandlersLocation
} from "../controllers/deliveryController";

// Implement the user routes:
router.post('/deliveries/add', addDelivery);
router.post('/delivery/pickup', pickupDelivery);
router.post('/deliveries/decrypt', decryptDeliveryDetails);
router.post('/deliveries/encrypt', isUserAuth, async (req: Request, res: Response) => {
    await encryptDeliveryDetails(req, res);
});
router.post('/deliveries/ids', getDeliveryIds);
router.get('/deliveries/:trackingId/track', trackDelivery);
router.put('/deliveries/:deliverId/update', updateDelivery);
router.post('/deliveries/history/user', getUserDeliveryHistory);
router.put('/deliveries/history/partner', getPartnerDeliveryHistory);
router.post('/deliveries/handler/location', getHandlersLocation);

export default router;
