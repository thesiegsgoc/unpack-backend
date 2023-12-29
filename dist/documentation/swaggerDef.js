"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = void 0;
const config_1 = __importDefault(require("../config"));
const { PORT } = config_1.default;
// const swaggerSchemas = jsYaml.load(
//   fs.readFileSync('./documentation/swaggerDefinitions.yaml', 'utf8')
// )
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Upack API Documentation',
        version: '1.0.0',
        description: 'API documentation for the Upack Infrastructure.',
    },
    servers: [
        {
            url: `http://localhost:${PORT}`,
            description: 'Development server',
        },
    ],
    // components: {
    //   schemas: swaggerSchemas, // Use the loaded schemas
    // },
};
exports.options = {
    swaggerDefinition,
    apis: ['./routes/*.ts'],
};
