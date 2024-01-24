"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
class SocketService {
    io;
    constructor(server) {
        this.io = new socket_io_1.Server(server);
        this.initializeSocketEvents();
    }
    initializeSocketEvents() {
        this.io.on('connection', (socket) => {
            console.log(`New connection: ${socket.id}`);
            socket.on('updateLocation', (locationData) => {
                console.log(`Location update from ${locationData.userId}:`, locationData);
                this.handleLocationUpdate(locationData);
            });
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
            });
        });
    }
    handleLocationUpdate(locationData) {
        // Emit location to specific room or globally, based on your application's logic
        // For example, to a room where users are tracking each other
        this.io.to('trackingRoom').emit('locationUpdate', locationData);
    }
}
exports.SocketService = SocketService;
