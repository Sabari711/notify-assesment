const io = require('socket.io-client');

// Connect to the WebSocket server
const socket = io('http://localhost:5000');

console.log('Connecting to WebSocket server...');

// Listen for connection
socket.on('connected', (data) => {
    console.log('✅ Connected to WebSocket server:', data);
});

// Listen for notifications
socket.on('notification', (notification) => {
    console.log('🔔 Received notification:', notification);
    console.log('   Type:', notification.type);
    console.log('   Message:', notification.message);
    console.log('   Data:', notification.data);
    console.log('   Timestamp:', notification.timestamp);
});

// Listen for disconnection
socket.on('disconnect', () => {
    console.log('❌ Disconnected from WebSocket server');
});

// Handle connection errors
socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error);
});

console.log('WebSocket test client ready. Create a project to see notifications!');
console.log('Press Ctrl+C to exit.');

// Keep the script running
process.on('SIGINT', () => {
    console.log('\nDisconnecting...');
    socket.disconnect();
    process.exit(0);
}); 