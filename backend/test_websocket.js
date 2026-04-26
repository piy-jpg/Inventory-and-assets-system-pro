// Test WebSocket connection to verify real-time functionality
const io = require('socket.io-client');

console.log('Testing WebSocket connection to inventory server...');

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  timeout: 5000,
  forceNew: true
});

socket.on('connect', () => {
  console.log('WebSocket connection successful!');
  console.log('Connected with socket ID:', socket.id);
  
  // Test listening for inventory updates
  socket.on('inventory:updated', (data) => {
    console.log('Received inventory update:', data);
  });
  
  // Test connection status
  socket.on('connected', (data) => {
    console.log('Server connection message:', data);
  });
  
  // Disconnect after 2 seconds
  setTimeout(() => {
    console.log('Test completed - disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection failed:', error.message);
  process.exit(1);
});

socket.on('disconnect', () => {
  console.log('WebSocket disconnected');
});
