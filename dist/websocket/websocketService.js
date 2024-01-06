"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importStar(require("ws"));
const driver_1 = __importDefault(require("../models/users/driver"));
const DeliveryOrderSchemal_1 = __importDefault(require("../models/DeliveryOrderSchemal"));
class WebSocketService {
    static instance;
    wss;
    constructor(server) {
        this.wss = new ws_1.Server(server);
        this.wss.on('connection', (ws) => {
            console.log('New client connected');
            ws.on('message', (message) => {
                console.log(`Received message => ${message}`);
                this.broadcast(message);
            });
            ws.on('message', (message) => {
                const data = JSON.parse(message);
                if (data.type === 'locationUpdate' && data.driverId) {
                    this.updateDriverLocation(data.driverId, data.location);
                }
            });
            ws.on('close', () => {
                console.log('Client has disconnected');
            });
        });
    }
    static getInstance(server) {
        if (!WebSocketService.instance) {
            if (!server) {
                throw new Error('WebSocket server needs to be initialized first.');
            }
            WebSocketService.instance = new WebSocketService(server);
        }
        return WebSocketService.instance;
    }
    broadcast(message) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(message);
            }
        });
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
    async getUserIdsToNotify(driverId) {
        // Query the database for active sessions involving this driver
        const activeSessions = await DeliveryOrderSchemal_1.default.find({
            driverId: driverId,
            status: 'active', // assuming 'active' is a status of an ongoing session
        });
        // Extract and return user IDs from these sessions
        return activeSessions.map((session) => session.userId);
    }
    async updateDriverLocation(driverId, location) {
        // Update driver's location in the database
        await driver_1.default.updateOne({ _id: driverId }, { $set: { currentLocation: location } });
        // Notify relevant users
        // this.notifyUsersAboutDriverLocation(driverId, location)
    }
}
exports.default = WebSocketService;
