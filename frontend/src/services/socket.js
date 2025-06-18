import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    connect() {
        if (this.socket && this.isConnected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('Connected to Socket.IO server');
            this.isConnected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
            this.isConnected = false;
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    getSocket() {
        if (!this.socket || !this.isConnected) {
            return this.connect();
        }
        return this.socket;
    }

    // Listen for real-time events
    onMemeCreated(callback) {
        const socket = this.getSocket();
        socket.off('meme_created');
        socket.on('meme_created', callback);
    }

    onMemeUpdated(callback) {
        const socket = this.getSocket();
        socket.off('meme_updated');
        socket.on('meme_updated', callback);
    }

    onMemeDeleted(callback) {
        const socket = this.getSocket();
        socket.off('meme_deleted');
        socket.on('meme_deleted', callback);
    }

    onBidPlaced(callback) {
        const socket = this.getSocket();
        socket.off('bid_placed');
        socket.on('bid_placed', callback);
    }

    onBidCancelled(callback) {
        const socket = this.getSocket();
        socket.off('bid_cancelled');
        socket.on('bid_cancelled', callback);
    }

    onVoteUpdated(callback) {
        const socket = this.getSocket();
        socket.off('vote_updated');
        socket.on('vote_updated', callback);
    }

    onCreditsUpdated(callback) {
        const socket = this.getSocket();
        socket.off('credits_updated');
        socket.on('credits_updated', callback);
    }

    // Remove event listeners
    offMemeCreated() {
        if (this.socket) {
            this.socket.off('meme_created');
        }
    }

    offMemeUpdated() {
        if (this.socket) {
            this.socket.off('meme_updated');
        }
    }

    offMemeDeleted() {
        if (this.socket) {
            this.socket.off('meme_deleted');
        }
    }

    offBidPlaced() {
        if (this.socket) {
            this.socket.off('bid_placed');
        }
    }

    offBidCancelled() {
        if (this.socket) {
            this.socket.off('bid_cancelled');
        }
    }

    offVoteUpdated() {
        if (this.socket) {
            this.socket.off('vote_updated');
        }
    }

    offCreditsUpdated() {
        if (this.socket) {
            this.socket.off('credits_updated');
        }
    }

    // Remove all listeners
    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }
}

export default new SocketService(); 