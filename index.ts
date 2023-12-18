import express from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv"
const app = express();
dotenv.config();

const PORT = process.env.PORT || 4111;
const database = process.env.MONGODB_URL;
const userRouter  = require("./src/routes/user");
const orderRouter = require('./src/routes/order');
const zoneRouter  = require("./src/routes/zone");
const deliveryRouter = require('./src/routes/delivery');

// MongoDB connection:
mongoose.connect(database, {
    useUnifiedTopology: true,
    useNewUrlParser: true 
})
.then(() => console.log('Database connected successfully...'))
.catch((err:any) => console.log(err));

// Implement the routes here:
app.use(express.json());
app.use(userRouter);
app.use(zoneRouter);
app.use(orderRouter);
app.use(deliveryRouter);

// Serving port details:
app.listen(PORT, console.log("Server has started at port " + PORT));