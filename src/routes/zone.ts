// Importing express and its types
import express, { Request, Response } from 'express';
const router = express.Router();

// Importing controller functions
import {
    deleteZone,
    registerZone,
    addZoneHandler,
    updateZoneInfo,
    deleteZoneHandler,
    updateZoneHandlerAvailability,
    assignHandler,
    deliveryCost
} from '../controllers/zoneController';

// Implement the user routes:
router.post('/zone/register', registerZone);
router.post('/zone/add-zone-handler', addZoneHandler);
router.put('/zone/delete-zone-handler', deleteZoneHandler);
router.put('/zone/update-handler-availability', updateZoneHandlerAvailability);
router.put('/zone/update-zone-info', updateZoneInfo);
router.delete('/zone/delete', deleteZone);
router.put('/zone/assign-package-handler', assignHandler);
router.post('/zone/deliveryCost', deliveryCost);

export default router;
