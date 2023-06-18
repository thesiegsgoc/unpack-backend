/* 3rd Party Modules */
const express = require('express');
const router = express.Router();

/* Unpack Modules */
const {
    deleteZone,
    registerZone,
    addZoneHandler,
    updateZoneInfo,
    deleteZoneHandler,
    updateZoneHandlerAvailability,
    assignHandler
} = require('../controllers/zoneController');

// Implement the user routes:
router.post('/zone/register', registerZone);
router.post('/zone/add-zone-handler', addZoneHandler);
router.put('/zone/delete-zone-handler', deleteZoneHandler);
router.put('/zone/update-handler-availability', updateZoneHandlerAvailability);
router.put('/zone/update-zone-info', updateZoneInfo);
router.delete('/zone/delete', deleteZone);
router.put('/zone/assign-package-handler', assignHandler);
module.exports = router;