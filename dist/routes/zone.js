"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing express and its types
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Importing controller functions
const zoneController_1 = require("../controllers/zoneController");
// Implement the user routes:
router.get('/zones', zoneController_1.getAllZonesController);
router.post('/zone/register', zoneController_1.registerZoneController);
router.post('/zone/add-zone-handler', zoneController_1.addZoneHandlerController);
router.put('/zone/delete-zone-handler', zoneController_1.deleteZoneHandlerController);
router.put('/zone/update-handler-availability', zoneController_1.updateZoneHandlerAvailabilityController);
router.put('/zone/update-zone-info', zoneController_1.updateZoneInfoController);
router.delete('/zone/delete', zoneController_1.deleteZoneController);
router.put('/zone/assign-package-handler', zoneController_1.assignHandlerController);
router.post('/zone/deliveryCost', zoneController_1.deliveryCostController);
exports.default = router;
