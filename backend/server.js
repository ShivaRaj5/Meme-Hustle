const express = require("express");
const cors = require("cors");
const http = require("http");
const { initializeSocket } = require("./config/socket");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

// Middleware
app.use(cors({
    origin: ["https://meme-hustle-1.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

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
