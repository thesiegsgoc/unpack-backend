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
const order_1 = __importDefault(require("./routes/order"));
const zone_1 = __importDefault(require("./routes/zone"));
const delivery_1 = __importDefault(require("./routes/delivery"));
const driver_1 = __importDefault(require("./routes/driver"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Configure CORS for Express
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
}));
const httpServer = (0, http_1.createServer)(app);
const ioServer = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    },
});
const { MONGODB_URL, PORT } = config_1.default;
mongoose_1.default
    .connect(MONGODB_URL)
    .then(() => console.log('Database connected successfully...'))
    .catch((err) => console.log(err));
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});
app.use(express_1.default.json());
app.use(user_1.default);
app.use(zone_1.default);
app.use(order_1.default);
app.use(delivery_1.default);
app.use(driver_1.default);
app.get('/', (req, res) => {
    res.send('Server is ready');
});
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'The Route you requested was not found, please check your routes and try again',
    });
});
ioServer.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});
httpServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
