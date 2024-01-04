import { Server, IncomingMessage } from 'http'
import WebSocket from 'ws'
import queryString from 'querystring'

export default (expressServer: Server) => {
  //Create instance of webscoket server with noServer true which means we use the http server port
  const websocketServer = new WebSocket.Server({
    noServer: true,
    path: '/websockets',
  })

  //Handling request to upgrade from http to ws sever
  expressServer.on('upgrade', (request: IncomingMessage, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit('connection', websocket, request)
    })
  })

  websocketServer.on(
    'connection',
    (websocketConnection: WebSocket, connectionRequest: IncomingMessage) => {
      const [_path, params] = connectionRequest?.url?.split('?') || []
      const connectionParams = queryString.parse(params)

      // NOTE: connectParams are not used here but good to understand how to get
      // to them if you need to pass data with the connection to identify it (e.g., a userId).
      console.log('Connection ', JSON.stringify(connectionParams))

      websocketConnection.on('message', (message) => {
        const parsedMessage = JSON.stringify(message.toString())
        console.log(parsedMessage)
      })
    }
  )
}
