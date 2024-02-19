import express, { Router } from 'express'
import * as DriverController from '../controllers/driverController'

const router: Router = express.Router()

router.post('/driver/register', DriverController.createDriverController)
router.post('/driver/login', DriverController.loginDriverController)
router.delete('/driver/delete', DriverController.deleteDriverController)
router.put('/driver/update', DriverController.updateDriverController)
router.get('/drivers', DriverController.getAllDriversController)
router.get('/driver/:userId', DriverController.getDriverDetailsController)
router.get(
  '/drivers/available',
  DriverController.getAllAvailableDriversController
)
router.get(
  '/driver/availability/:driverId',
  DriverController.isDriverAvailableController
)

export default router
