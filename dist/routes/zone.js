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
router.post('/zone/register', zoneController_1.registerZone);
router.post('/zone/add-zone-handler', zoneController_1.addZoneHandler);
router.put('/zone/delete-zone-handler', zoneController_1.deleteZoneHandler);
router.put('/zone/update-handler-availability', zoneController_1.updateZoneHandlerAvailability);
router.put('/zone/update-zone-info', zoneController_1.updateZoneInfo);
router.delete('/zone/delete', zoneController_1.deleteZone);
router.put('/zone/assign-package-handler', zoneController_1.assignHandler);
router.post('/zone/deliveryCost', zoneController_1.deliveryCost);
exports.default = router;
