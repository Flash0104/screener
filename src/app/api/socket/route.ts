import { NextRequest } from 'next/server';
import { Server as ServerIO } from 'socket.io';

export const dynamic = 'force-dynamic';

interface RoomData {
  id: string;
  host: string;
  participants: string[];
}

const rooms: Map<string, RoomData> = new Map();

let io: ServerIO;

function initializeSocketIO(server: any) {
  if (!io) {
    io = new ServerIO(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join-room', (data: { roomId: string; isHost: boolean }) => {
        const { roomId, isHost } = data;
        
        socket.join(roomId);
        
        let room = rooms.get(roomId);
        if (!room) {
          room = {
            id: roomId,
            host: isHost ? socket.id : '',
            participants: []
          };
          rooms.set(roomId, room);
        }
        
        if (isHost && !room.host) {
          room.host = socket.id;
        }
        
        if (!room.participants.includes(socket.id)) {
          room.participants.push(socket.id);
        }

        socket.to(roomId).emit('user-joined', {
          userId: socket.id,
          participants: room.participants
        });

        socket.emit('room-participants', {
          participants: room.participants.filter(id => id !== socket.id)
        });

        console.log(`User ${socket.id} joined room ${roomId}`);
      });

      socket.on('offer', (data: { offer: RTCSessionDescriptionInit; targetId: string; roomId: string }) => {
        socket.to(data.targetId).emit('offer', {
          offer: data.offer,
          fromId: socket.id
        });
      });

      socket.on('answer', (data: { answer: RTCSessionDescriptionInit; targetId: string; roomId: string }) => {
        socket.to(data.targetId).emit('answer', {
          answer: data.answer,
          fromId: socket.id
        });
      });

      socket.on('ice-candidate', (data: { candidate: RTCIceCandidate; targetId: string; roomId: string }) => {
        socket.to(data.targetId).emit('ice-candidate', {
          candidate: data.candidate,
          fromId: socket.id
        });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        rooms.forEach((room, roomId) => {
          const index = room.participants.indexOf(socket.id);
          if (index > -1) {
            room.participants.splice(index, 1);
            
            if (room.host === socket.id && room.participants.length > 0) {
              room.host = room.participants[0];
            }
            
            socket.to(roomId).emit('user-left', {
              userId: socket.id,
              newHost: room.host,
              participants: room.participants
            });
            
            if (room.participants.length === 0) {
              rooms.delete(roomId);
            }
          }
        });
      });
    });
  }
  
  return io;
}

export async function GET(req: NextRequest) {
  // Initialize Socket.IO with the server instance
  // Note: This is a simplified version - in production you'd want proper server setup
  console.log('Socket.IO endpoint hit');
  return new Response('Socket.IO initialized', { status: 200 });
}

export async function POST(req: NextRequest) {
  return new Response('Socket.IO POST', { status: 200 });
} 