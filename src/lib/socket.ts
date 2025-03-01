import { io } from 'socket.io-client';

export type ResearchProgressEvent = {
  type: 'info' | 'error' | 'success';
  message: string;
  data?: any;
  timestamp: string;
};

export const socket = io('http://10.0.0.243:3000/research-progress', {
  transports: ['websocket'],
  autoConnect: true
}); 