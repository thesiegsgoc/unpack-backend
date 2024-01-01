"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJwtToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const { JWT_SECRET_CODE } = config_1.default;
const generateJwtToken = async (userId) => {
    const token = jsonwebtoken_1.default.sign({ userId: userId }, JWT_SECRET_CODE, {
        expiresIn: '30d',
    });
    return token;
};
exports.generateJwtToken = generateJwtToken;
