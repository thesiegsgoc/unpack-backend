"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const querystring_1 = __importDefault(require("querystring"));
exports.default = (expressServer) => {
    //Create instance of webscoket server with noServer true which means we use the http server port
    const websocketServer = new ws_1.default.Server({
        noServer: true,
        path: '/websockets',
    });
    //Handling request to upgrade from http to ws sever
    expressServer.on('upgrade', (request, socket, head) => {
        websocketServer.handleUpgrade(request, socket, head, (websocket) => {
            websocketServer.emit('connection', websocket, request);
        });
    });
    websocketServer.on('connection', (websocketConnection, connectionRequest) => {
        const [_path, params] = connectionRequest?.url?.split('?') || [];
        const connectionParams = querystring_1.default.parse(params);
        // NOTE: connectParams are not used here but good to understand how to get
        // to them if you need to pass data with the connection to identify it (e.g., a userId).
        console.log('Connection ', JSON.stringify(connectionParams));
        websocketConnection.on('message', (message) => {
            const parsedMessage = JSON.stringify(message.toString());
            console.log(parsedMessage);
        });
    });
};
