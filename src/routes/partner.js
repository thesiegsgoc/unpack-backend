/* 3rd Party Modules */
const express = require('express');
const router = express.Router();

/* Unpack Modules */
const {
    registerPartner,
    updatePartnerInfo,
    encryptPickupData,
    pickupPackage
} = require('../controllers/partnerController');

// Implement the user routes:
router.get('/partner/pickup', pickupPackage);
router.post('/partner/register', registerPartner);
router.post('/partner/encrypt', encryptPickupData);
router.put('/update-partner-info',updatePartnerInfo);
module.exports = router;