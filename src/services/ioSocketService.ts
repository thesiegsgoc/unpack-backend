import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import config from '../config'

const { JWT_SECRET_CODE } = config

export class SocketService {
  private io: Server

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
      },
    })

    this.initializeSocketEvents()
  }

  private initializeSocketEvents(): void {
    // this.io.use((socket: Socket, next) => {
    //   const token = socket.handshake.query.token

    //   if (typeof token === 'string') {
    //     jwt.verify(token, JWT_SECRET_CODE, (err, decoded) => {
    //       if (err) {
    //         return next(new Error('Authentication error'))
    //       }
    //       // Token is valid, store decoded information in the socket for later use
    //       socket.user = decoded // Attach the user's decoded token data to the socket
    //       next()
    //     })
    //   } else {
    //     return next(new Error('Token is not a string'))
    //   }
    // })

    this.io.on('connection', (socket: Socket) => {
      // Listen to location updates and handle based on user type

      socket.on(
        'updateLocation',
        (locationData: LocationData, ackCallback: Function) => {
          console.log(
            `Location update from ${locationData.userId}:`,
            locationData
          )

          const userType = locationData.usertype
          if (userType === 'driver') {
            this.handleDriverLocationUpdate(locationData)
          } else if (userType === 'user') {
            this.handleUserLocationUpdate(locationData)
          }

          // Once processing is complete, call the acknowledgment callback
          // You can send back any data as a response, here just sending a simple message
          ackCallback({
            status: 'success',
            message: 'Location update received',
          })
        }
      )

      socket.on('disconnect', () => {
        console.log(`User disconnected`)
      })
    })
  }

  private handleDriverLocationUpdate(locationData: LocationData): void {
    // Save driver location data to the database
    saveLocationToDatabase(locationData)
    // Broadcast to users tracking drivers
    this.io.emit('driverLocationUpdate', locationData)
  }

  private handleUserLocationUpdate(locationData: LocationData): void {
    // Save user location data to the database
    saveLocationToDatabase(locationData)
    this.io.emit('userLocationUpdate', locationData)
    // Handle user-specific location logic
    // Example: Emit to specific driver or to a group of drivers
    // this.io.to(someDriverId).emit('userLocationUpdate', locationData);
  }
}

// Mock database saving function
function saveLocationToDatabase(locationData: LocationData) {
  console.log('Saving location to database:', locationData)
  // Implement the actual database saving logic here
}

/**

How to send location For a Driver: Assuming this code is running on the driver's app

1. Get the driver's current location
2. Save the location to the database
3. Broadcast the location update to all other drivers
function sendLocationUpdate(latitude, longitude) {
  const locationData = { latitude, longitude };
  socket.emit('driverLocationUpdate', locationData);
}
4. After the delivery is over delete the location history from database and save the starting point to destination only


How to send location For a User: Assuming this code is running on the user's app
function sendLocationUpdate(latitude, longitude) {
  const locationData = { latitude, longitude };
  socket.emit('userLocationUpdate', locationData);
}

 */

/**
 *TODO: Send driver live location 
 io.emit('driverAssigned', { deliveryId: delivery._id, driverId: driver._id });
 */
