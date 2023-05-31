/* 3rd Party Modules */
const express = require("express");
const router = express.Router();
const { isUserAuth } = require('../auth/isAuth');
console.log(isUserAuth)
/* Unpack Modules */
const { 
    addDelivery,
    trackDelivery,
    updateDelivery,
    getUserDeliveryHistory,
    encryptDeliveryDetails,
    decryptDeliveryDetails,
    getPartnerDeliveryHistory,
    getDeliveryIds
} = require("../controllers/deliveryController");

// Implement the user routes:
router.post('/deliveries/add', addDelivery);
router.post('/deliveries/decrypt', decryptDeliveryDetails);
router.post('/deliveries/encrypt', isUserAuth, async (req, res) => {
    await encryptDeliveryDetails(req, res);
});
router.post('/deliveries/ids', getDeliveryIds);
router.get('/deliveries/:trackingId/track', trackDelivery);
router.put('/deliveries/:deliverId/update', updateDelivery);
router.post('/deliveries/history/user', getUserDeliveryHistory);
router.put('/deliveries/history/partner', getPartnerDeliveryHistory);

module.exports = router;