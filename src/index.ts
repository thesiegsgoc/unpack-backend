import express, {Request, Response} from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv"
import config from './config'
import userRouter from "./routes/user";
import orderRouter from "./routes/order";
import zoneRouter from "./routes/zone";
import deliveryRouter from "./routes/delivery";
//Initializing Environment Variables for the whole codebase:
dotenv.config();

// Initializing express
const app = express();

// Destructuring the config object
const { MONGODB_URL, PORT } = config

// MongoDB connection:
mongoose.connect(MONGODB_URL)
.then(() => console.log('Database connected successfully...'))
.catch((err:any) => console.log(err));

// Implement the routes here:
app.use(express.json());
app.use(userRouter);
app.use(zoneRouter);
app.use(orderRouter);
app.use(deliveryRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('Server is ready');
});

// Serving port details:
app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));