"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const config_1 = __importDefault(require("../config"));
const { JWT_SECRET_CODE } = config_1.default;
// Mock function to get user type
function getUserType(userId) {
    // Implement logic to determine if a user is a 'user' or 'driver'
    // based on the userId in the location data coming from the client
    return 'user'; // or 'driver'
}
class SocketService {
    io;
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                credentials: true,
            },
        });
        this.initializeSocketEvents();
    }
    initializeSocketEvents() {
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
        this.io.on('connection', (socket) => {
            // Listen to location updates and handle based on user type
            // socket.on(
            //   'updateLocation',
            //   (locationData: LocationData, ackCallback: Function) => {
            //     console.log(
            //       `Location update from ${locationData.userId}:`,
            //       locationData
            //     )
            //     const userType = getUserType(locationData.userId)
            //     if (userType === 'driver') {
            //       this.handleDriverLocationUpdate(locationData)
            //     } else if (userType === 'user') {
            //       this.handleUserLocationUpdate(locationData)
            //     }
            //     // Once processing is complete, call the acknowledgment callback
            //     // You can send back any data as a response, here just sending a simple message
            //     ackCallback({
            //       status: 'success',
            //       message: 'Location update received',
            //     })
            //   }
            // )
            socket.on('updateLocation', (locationData, ackCallback) => {
                console.log('Received location update:', locationData);
                ackCallback({
                    status: 'success',
                    message: 'Echo back - location received',
                });
            });
            socket.on('disconnect', () => {
                console.log(`User disconnected`);
            });
        });
    }
    handleDriverLocationUpdate(locationData) {
        // Save driver location data to the database
        saveLocationToDatabase(locationData);
        // Broadcast to users tracking drivers
        this.io.emit('driverLocationUpdate', locationData);
    }
    handleUserLocationUpdate(locationData) {
        // Save user location data to the database
        saveLocationToDatabase(locationData);
        this.io.emit('userLocationUpdate', locationData);
        // Handle user-specific location logic
        // Example: Emit to specific driver or to a group of drivers
        // this.io.to(someDriverId).emit('userLocationUpdate', locationData);
    }
}
exports.SocketService = SocketService;
// Mock database saving function
function saveLocationToDatabase(locationData) {
    console.log('Saving location to database:', locationData);
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
