const socketIo = require('socket.io');

let io = null;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:3001"],
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            credentials: true
        },
    });

    // Socket.IO connection handling
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized. Call initializeSocket first.');
    }
    return io;
};

module.exports = { initializeSocket, getIO }; 