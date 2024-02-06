import { Socket } from 'socket.io'

declare module 'socket.io' {
  interface Socket {
    user?: any // Define `user` with a more specific type if possible
  }
}
