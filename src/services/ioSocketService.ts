import { Server, Socket } from 'socket.io'

type UserType = 'user' | 'driver'

// Mock function to get user type
function getUserType(userId: string): UserType {
  // Implement logic to determine if a user is a 'user' or 'driver'
  // based on the userId in the location data coming from the client
  return 'user' // or 'driver'
}

export class SocketService {
  private io: Server

  constructor(server: any) {
    this.io = new Server(server)
    this.initializeSocketEvents()
  }

  private initializeSocketEvents(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`New connection: ${socket.id}`)

      // Listen to location updates and handle based on user type
      socket.on('updateLocation', (locationData: LocationData) => {
        console.log(
          `Location update from ${locationData.userId}:`,
          locationData
        )
        const userType = getUserType(locationData.userId)
        if (userType === 'driver') {
          this.handleDriverLocationUpdate(locationData)
        } else if (userType === 'user') {
          this.handleUserLocationUpdate(locationData)
        }
      })

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`)
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
