"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
router.get('/api/users', (req, res, next) => {
    User_1.default.find({})
        .then((users) => {
        res.json(users);
    })
        .catch((err) => {
        next(err);
    });
});
exports.default = router;
