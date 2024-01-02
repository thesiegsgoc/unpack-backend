"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
// WebSocket server URL
const serverUrl = 'ws://localhost:3000/websockets'; // Update with your server URL
// Create a WebSocket instance
const ws = new ws_1.default(serverUrl);
// Event listener for when the connection is established
ws.on('open', () => {
    console.log('WebSocket connection established');
    // Send a test message to the server
    const testMessage = { type: 'test', content: 'Hello, WebSocket!' };
    ws.send(JSON.stringify(testMessage));
});
// Event listener for incoming messages
ws.on('message', (message) => {
    console.log('Received message:', message);
    // Close the connection after receiving a message (you can customize this behavior)
    ws.close();
});
// Event listener for connection closure
ws.on('close', () => {
    console.log('WebSocket connection closed');
});
// Event listener for connection errors
ws.on('error', (error) => {
    console.error('WebSocket connection error:', error.message);
});
