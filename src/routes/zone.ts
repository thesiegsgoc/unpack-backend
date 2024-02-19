// Importing express and its types
import express, { Request, Response } from 'express'
const router = express.Router()

// Importing controller functions
import {
  deleteZoneController as deleteZone,
  registerZoneController as registerZone,
  addZoneHandlerController as addZoneHandler,
  updateZoneInfoController as updateZoneInfo,
  deleteZoneHandlerController as deleteZoneHandler,
  updateZoneHandlerAvailabilityController as updateZoneHandlerAvailability,
  assignHandlerController as assignHandler,
  deliveryCostController as deliveryCost,
  getAllZonesController,
} from '../controllers/zoneController'

// Implement the user routes:
router.get('/zones', getAllZonesController)
router.post('/zone/register', registerZone)
router.post('/zone/add-zone-handler', addZoneHandler)
router.put('/zone/delete-zone-handler', deleteZoneHandler)
router.put('/zone/update-handler-availability', updateZoneHandlerAvailability)
router.put('/zone/update-zone-info', updateZoneInfo)
router.delete('/zone/delete', deleteZone)
router.put('/zone/assign-package-handler', assignHandler)
router.post('/zone/deliveryCost', deliveryCost)

export default router
