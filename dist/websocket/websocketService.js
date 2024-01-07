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
    userConnections;
    // Private constructor to enforce singleton pattern
    constructor(server) {
        this.wss = new ws_1.Server(server);
        this.userConnections = new Map(); // Initialize map to track user connections
        // Handle new connections
        this.wss.on('connection', (ws) => {
            console.log('New client connected');
            // Handle incoming messages
            ws.on('message', (message) => {
                console.log(`Received message: ${message}`);
                const data = JSON.parse(message);
                // Associate the WebSocket connection with the user ID
                if (data.userId) {
                    this.userConnections.set(data.userId, ws);
                }
                // Update driver location if the message is a location update
                if (data.type === 'locationUpdate' && data.driverId) {
                    this.updateDriverLocation(data.driverId, data.location);
                }
            });
            // Handle disconnection
            ws.on('close', () => {
                console.log('Client has disconnected');
                // Optionally, remove the user from userConnections here
            });
        });
    }
    // Singleton instance accessor
    static getInstance(server) {
        if (!WebSocketService.instance) {
            if (!server) {
                throw new Error('WebSocket server needs to be initialized first.');
            }
            WebSocketService.instance = new WebSocketService(server);
        }
        return WebSocketService.instance;
    }
    // Update the driver's location in the database
    async updateDriverLocation(driverId, location) {
        await driver_1.default.updateOne({ _id: driverId }, { $set: { currentLocation: location } });
        // Notify relevant users about the location update
        this.notifyUsersAboutDriverLocation(driverId, location);
    }
    // Notify users who are tracking this driver
    async notifyUsersAboutDriverLocation(driverId, location) {
        const userIdsToNotify = await this.getUserIdsToNotify(driverId);
        userIdsToNotify.forEach((userId) => {
            const userSocket = this.userConnections.get(userId);
            if (userSocket && userSocket.readyState === ws_1.default.OPEN) {
                userSocket.send(JSON.stringify({
                    type: 'driverLocationUpdate',
                    driverId,
                    location,
                }));
            }
        });
    }
    // Find users who need to be notified based on active delivery sessions
    async getUserIdsToNotify(driverId) {
        const activeSessions = await DeliveryOrderSchemal_1.default.find({
            driverId: driverId,
            status: 'accepted', // Assuming 'accepted' represents an active session
        });
        // Extract user IDs from these sessions
        return activeSessions.map((session) => session.senderId.toString());
    }
}
exports.default = WebSocketService;
