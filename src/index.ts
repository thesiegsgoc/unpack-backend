import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import config from './config'
import userRouter from './routes/user'
import orderRouter from './routes/order'
import zoneRouter from './routes/zone'
import deliveryRouter from './routes/delivery'
import driverRouter from './routes/driver'
import { Server as SocketServer, Socket } from 'socket.io'
import { createServer } from 'http'
import cors from 'cors'

dotenv.config()

const app = express()
// Configure CORS for Express
app.use(
  cors({
    origin: '*', // Your client's URL
    credentials: true,
  })
)

const httpServer = createServer(app)

const ioServer = new SocketServer(httpServer, {
  cors: {
    origin: '*', // Your client's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
})

const { MONGODB_URL, PORT } = config

mongoose
  .connect(MONGODB_URL)
  .then(() => console.log('Database connected successfully...'))
  .catch((err: any) => console.log(err))

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  next()
})

app.use(express.json())
app.use(userRouter)
app.use(zoneRouter)
app.use(orderRouter)
app.use(deliveryRouter)
app.use(driverRouter)

app.get('/', (req: Request, res: Response) => {
  res.send('Server is ready')
})

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    message:
      'The Route you requested was not found, please check your routes and try again',
  })
})

ioServer.on('connection', (socket: Socket) => {
  console.log('A user connected')

  socket.on('disconnect', () => {
    console.log('A user disconnected')
  })
})

httpServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
