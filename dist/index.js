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
//Initializing Environment Variables for the whole codebase:
dotenv_1.default.config();
// Initializing express
const app = (0, express_1.default)();
// Destructuring the config object
const { MONGODB_URL, PORT } = config_1.default;
// MongoDB connection:
mongoose_1.default.connect(MONGODB_URL)
    .then(() => console.log('Database connected successfully...'))
    .catch((err) => console.log(err));
// Implement the routes here:
app.use(express_1.default.json());
app.use(user_1.default);
app.use(zone_1.default);
app.use(order_1.default);
app.use(delivery_1.default);
app.get('/', (req, res) => {
    res.send('Server is ready');
});
// Serving port details:
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));