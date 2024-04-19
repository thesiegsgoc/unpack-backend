// Importing express and its types
import express, { Request, Response } from 'express'
const router = express.Router()

// Importing your custom middleware and controller functions
import { isUserAuth } from '../auth/isAuth'
import {
  createDeliveryController,
  trackDeliveryController as trackDelivery,
  updateDeliveryController as updateDelivery,
  getUserDeliveryHistoryController as getUserDeliveryHistory,
  encryptDeliveryDetailsController,
  getPartnerDeliveryHistoryController as getPartnerDeliveryHistory,
  getDeliveryIdsController as getDeliveryIds,
  pickupDeliveryController as pickupDelivery,
  getHandlersLocationController as getHandlersLocation,
  getAllDeliveriesController,
  calculateDeliveryCostController,
  getDeliveryByIdController,
} from '../controllers/deliveryController'

// TODO: return the isUserAuth middleware to the route above as bellow
// router.post('/deliveries/encrypt', isUserAuth, async (req: RequestWithUser, res: Response) => {
//     await encryptDeliveryDetails(req, res);
// });

// Versioning and plural nouns
router.get('/deliveries', getAllDeliveriesController)
router.post(
  '/deliveries/calculate-delivery-cost',
  calculateDeliveryCostController
)
router.post('/deliveries/create', createDeliveryController)
router.post('/deliveries/pickup', pickupDelivery)
// router.post('/deliveries/decrypt', encryptDeliveryDetailsController)
// router.post('/deliveries/match-pickupto-delivery', () =>
//   console.log('match-pickupto-delivery')
// )

// Secure endpoint with isUserAuth middleware, isUserAuth,
router.post('/deliveries/encrypt', encryptDeliveryDetailsController)

router.post('/deliveries/ids', getDeliveryIds)
router.get('/deliveries/:trackingId/track', trackDelivery)
router.put('/deliveries/:deliverId/update', updateDelivery)
router.post('/deliveries/history/user', getUserDeliveryHistory)
router.put('/deliveries/history/partner', getPartnerDeliveryHistory)
router.post('/deliveries/handler/location', getHandlersLocation)
router.post('/deliveries/:deliveryId', getDeliveryByIdController)

export default router
