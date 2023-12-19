"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const orderController_1 = require("../controllers/orderController");
router.post('/add-order', (req, res) => {
    (0, orderController_1.addOrder)(req, res); // Assuming addOrder takes req and res as arguments
});
exports.default = router;
