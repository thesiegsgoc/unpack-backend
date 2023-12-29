"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = void 0;
const config_1 = __importDefault(require("./config"));
const { PORT } = config_1.default;
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Upack API Documentation',
        version: '1.0.0',
        description: 'API documentation for the Upack Infrastracture.',
    },
    servers: [
        {
            url: `http://localhost:${PORT}`,
            description: 'Development server',
        },
    ],
};
exports.options = {
    swaggerDefinition,
    apis: ['./routes/*.ts'],
};
