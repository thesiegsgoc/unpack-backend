"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = __importDefault(require("./config"));
const user_1 = __importDefault(require("./routes/user"));
const zone_1 = __importDefault(require("./routes/zone"));
const delivery_1 = __importDefault(require("./routes/delivery"));
const driver_1 = __importDefault(require("./routes/driver"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerDef_1 = require("./documentation/swaggerDef");
const cors_1 = __importDefault(require("cors"));
const websocketService_1 = __importDefault(require("./websocket/websocketService"));
// Swagger setup
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerDef_1.options);
//Initializing Environment Variables for the whole codebase:
dotenv_1.default.config();
// Initializing express
const app = (0, express_1.default)();
// Destructuring the config object
const { MONGODB_URL, PORT } = config_1.default;
// MongoDB connection:
mongoose_1.default
    .connect(MONGODB_URL)
    .then(() => console.log('Database connected successfully...'))
    .catch((err) => console.log(err));
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173'],
}));
// Implement the routes here:
app.use(express_1.default.json());
app.use(user_1.default);
app.use(zone_1.default);
app.use(delivery_1.default);
app.use(driver_1.default);
// Default route
app.get('/', (req, res) => {
    res.send('Server is ready');
});
// Swagger setup
// app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
// Error when a route is not on the server
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'The Route you requested was not found, please check your routes and try again',
    });
});
// Serving port details:
const server = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
const webSocketService = websocketService_1.default.getInstance({ server });
