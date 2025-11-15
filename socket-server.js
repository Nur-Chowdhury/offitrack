import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/notify') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { recipientId, notification } = JSON.parse(body);
                const socketId = userSocketMap.get(recipientId);
                if (socketId) {
                    io.to(socketId).emit('notification', notification);
                    console.log(`Emitted notification to user ${recipientId} on socket ${socketId}`);
                } else {
                    console.log(`Could not find active socket for user ${recipientId}`);
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Notification processed' }));
            } catch (e) {
                console.error('Error processing notification request:', e);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404).end();
    }
});

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const userSocketMap = new Map();

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('register', (userId) => {
        if (userId) {
            console.log(`Registering user ${userId} to socket ${socket.id}`);
            userSocketMap.set(userId, socket.id);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        for (let [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                console.log(`Unregistered user ${userId} from socket ${socket.id}`);
                break;
            }
        }
    });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.IO server listening on http://localhost:${PORT}`);
});