import {io} from 'socket.io-client';

let socketInstance = null;

export const createSocket = (url, options) => {
  if (!socketInstance) {
    socketInstance = io(url, options);
  }
  return socketInstance;
};
