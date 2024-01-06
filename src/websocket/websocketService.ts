import WebSocket, { Server as WebSocketServer } from 'ws'
import DriverModel from '../models/users/driver'
import DeliveryModel from '../models/DeliveryOrderSchemal'
class WebSocketService {
  private static instance: WebSocketService
  private wss: WebSocketServer
  private constructor(server: WebSocket.ServerOptions) {
    this.wss = new WebSocketServer(server)

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New client connected')

      ws.on('message', (message: string) => {
        console.log(`Received message => ${message}`)
        this.broadcast(message)
      })

      ws.on('message', (message: any) => {
        const data = JSON.parse(message)
        if (data.type === 'locationUpdate' && data.driverId) {
          this.updateDriverLocation(data.driverId, data.location)
        }
      })

      ws.on('close', () => {
        console.log('Client has disconnected')
      })
    })
  }

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

  broadcast(message: string): void {
    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }

  //   private async notifyUsersAboutDriverLocation(
  //     driverId: string,
  //     userID: string,
  //     location: { latitude: number; longitude: number }
  //   ) {
  //     // Assuming getUserIdsToNotify is an async function returning a Promise<string[]>
  //     const userIdsToNotify = await this.getUserIdsToNotify(driverId)

  //     if (userIdsToNotify) {
  //       userIdsToNotify.forEach((userId) => {
  //         const userSocket = this.clients.get(userId)
  //         if (userSocket && userSocket.readyState === WebSocket.OPEN) {
  //           userSocket.send(
  //             JSON.stringify({
  //               type: 'driverLocationUpdate',
  //               driverId,
  //               location,
  //             })
  //           )
  //         }
  //       })
  //     }
  //   }

  private async getUserIdsToNotify(driverId: string): Promise<string[]> {
    // Query the database for active sessions involving this driver
    const activeSessions = await DeliveryModel.find({
      driverId: driverId,
      status: 'active', // assuming 'active' is a status of an ongoing session
    })

    // Extract and return user IDs from these sessions
    return activeSessions.map((session: any) => session.userId)
  }

  async updateDriverLocation(
    driverId: string,
    location: { latitude: number; longitude: number }
  ) {
    // Update driver's location in the database
    await DriverModel.updateOne(
      { _id: driverId },
      { $set: { currentLocation: location } }
    )

    // Notify relevant users
    // this.notifyUsersAboutDriverLocation(driverId, location)
  }
}

export default WebSocketService
