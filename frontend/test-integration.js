// Test script to verify frontend-backend integration
// Run this in the browser console or as a Node.js script

const API_BASE_URL = 'http://localhost:5000/api';

async function testBackendConnection() {
    console.log('🧪 Testing backend connection...');
    
    try {
        // Test health check
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
        
        // Test memes endpoint
        const memesResponse = await fetch(`${API_BASE_URL}/memes`);
        const memesData = await memesResponse.json();
        console.log('✅ Memes endpoint:', memesData);
        
        // Test leaderboard endpoint
        const leaderboardResponse = await fetch(`${API_BASE_URL}/leaderboard/trending`);
        const leaderboardData = await leaderboardResponse.json();
        console.log('✅ Leaderboard endpoint:', leaderboardData);
        
        console.log('🎉 All backend endpoints are working!');
        
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        console.log('Make sure the backend server is running on http://localhost:5000');
    }
}

// Test Socket.IO connection
function testSocketConnection() {
    console.log('🔌 Testing Socket.IO connection...');
    
    // This would need to be run in the browser with socket.io-client
    if (typeof io !== 'undefined') {
        const socket = io('http://localhost:5000');
        
        socket.on('connect', () => {
            console.log('✅ Socket.IO connected successfully!');
        });
        
        socket.on('connect_error', (error) => {
            console.error('❌ Socket.IO connection failed:', error);
        });
        
        return socket;
    } else {
        console.log('⚠️ Socket.IO test skipped (run in browser)');
    }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.testBackendConnection = testBackendConnection;
    window.testSocketConnection = testSocketConnection;
    console.log('🧪 Test functions available: testBackendConnection(), testSocketConnection()');
}

// Run tests if this is a Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    testBackendConnection();
} 