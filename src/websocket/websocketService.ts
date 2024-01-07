import WebSocket, { Server as WebSocketServer } from 'ws'
import DriverModel from '../models/users/driver'
import DeliveryModel from '../models/DeliveryOrderSchemal'

class WebSocketService {
  private static instance: WebSocketService
  private wss: WebSocketServer
  private userConnections: Map<string, WebSocket>

  // Private constructor to enforce singleton pattern
  private constructor(server: WebSocket.ServerOptions) {
    this.wss = new WebSocketServer(server)
    this.userConnections = new Map() // Initialize map to track user connections

    // Handle new connections
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New client connected')

      // Handle incoming messages
      ws.on('message', (message: string) => {
        console.log(`Received message: ${message}`)
        const data = JSON.parse(message)

        // Associate the WebSocket connection with the user ID
        if (data.userId) {
          this.userConnections.set(data.userId, ws)
        }

        // Update driver location if the message is a location update
        if (data.type === 'locationUpdate' && data.driverId) {
          this.updateDriverLocation(data.driverId, data.location)
        }
      })

      // Handle disconnection
      ws.on('close', () => {
        console.log('Client has disconnected')
        // Optionally, remove the user from userConnections here
      })
    })
  }

  // Singleton instance accessor
  public static getInstance(
    server?: WebSocket.ServerOptions
  ): WebSocketService {
    if (!WebSocketService.instance) {
      if (!server) {
        throw new Error('WebSocket server needs to be initialized first.')
      }
      WebSocketService.instance = new WebSocketService(server)
    }
    return WebSocketService.instance
  }

  // Update the driver's location in the database
  async updateDriverLocation(
    driverId: string,
    location: { latitude: number; longitude: number }
  ) {
    await DriverModel.updateOne(
      { _id: driverId },
      { $set: { currentLocation: location } }
    )

    // Notify relevant users about the location update
    this.notifyUsersAboutDriverLocation(driverId, location)
  }

  // Notify users who are tracking this driver
  private async notifyUsersAboutDriverLocation(
    driverId: string,
    location: { latitude: number; longitude: number }
  ) {
    const userIdsToNotify = await this.getUserIdsToNotify(driverId)
    userIdsToNotify.forEach((userId) => {
      const userSocket = this.userConnections.get(userId)
      if (userSocket && userSocket.readyState === WebSocket.OPEN) {
        userSocket.send(
          JSON.stringify({
            type: 'driverLocationUpdate',
            driverId,
            location,
          })
        )
      }
    })
  }

  // Find users who need to be notified based on active delivery sessions
  private async getUserIdsToNotify(driverId: string): Promise<string[]> {
    const activeSessions = await DeliveryModel.find({
      driverId: driverId,
      status: 'accepted', // Assuming 'accepted' represents an active session
    })

    // Extract user IDs from these sessions
    return activeSessions.map((session) => session.senderId.toString())
  }
}

export default WebSocketService
