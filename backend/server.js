const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true
    },
});

// Middleware
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/memes", require("./routes/memes"));
app.use("/api/bids", require("./routes/bids"));
app.use("/api/votes", require("./routes/votes"));
app.use("/api/leaderboard", require("./routes/leaderboard"));

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "MemeHustle API is running!" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO server ready`);
});

module.exports = { io };
