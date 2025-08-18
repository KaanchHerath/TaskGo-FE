import { io } from 'socket.io-client';
import { getToken } from '../../utils/auth';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Initialize socket connection
  connect() {
    console.log('🔌 SocketService.connect() called');
    
    if (this.socket && this.isConnected) {
      console.log('✅ Socket already connected, returning existing socket');
      return this.socket;
    }

    const token = getToken();
    if (!token) {
      console.warn('❌ No authentication token found for socket connection');
      return null;
    }

    // Get API base URL from environment or use default
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    console.log('🔌 Connecting to Socket.IO server:', apiUrl);
    
    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.socket = io(apiUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5
    });
    
    console.log('🔌 Socket.IO instance created:', !!this.socket);

    this.setupEventHandlers();
    return this.socket;
  }

  // Setup socket event handlers
  setupEventHandlers() {
    console.log('🔌 Setting up socket event handlers');
    
    if (!this.socket) {
      console.log('❌ No socket instance available for event handler setup');
      return;
    }

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
      
      // Join user to their personal room
      const user = this.getCurrentUser();
      if (user && (user._id || user.userId)) {
        const userId = user._id || user.userId;
        this.socket.emit('join-user', userId);
        console.log('✅ Joined user room:', userId);
      } else {
        console.warn('⚠️ No user data available to join room');
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.isConnected = false;
      
      // If authentication error, try to reconnect with fresh token
      if (error.message && error.message.includes('Authentication error')) {
        console.log('🔄 Authentication error detected, will retry connection');
        // Socket.io will automatically retry with the reconnection logic
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('✅ Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      
      // Rejoin user room after reconnection
      const user = this.getCurrentUser();
      if (user && (user._id || user.userId)) {
        const userId = user._id || user.userId;
        this.socket.emit('join-user', userId);
        console.log('✅ Rejoined user room after reconnection:', userId);
      }
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });
    
    // Error handler
    this.socket.on('error', (error) => {
      console.error('❌ Socket error received:', error);
    });
    
    // Join user success handler
    this.socket.on('join-user-success', (data) => {
      console.log('✅ Successfully joined user room:', data);
    });
    
    // Test message listener
    this.socket.on('test-message', (data) => {
      console.log('🧪 Test message received:', data);
    });
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  // Listen for payment success events
  onPaymentSuccess(callback) {
    if (!this.socket) {
      this.connect();
    }

    const eventName = 'payment-success';
    this.socket.on(eventName, callback);
    
    // Store the listener for cleanup
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  // Listen for task updates
  onTaskUpdate(callback) {
    if (!this.socket) {
      this.connect();
    }

    const eventName = 'task-update';
    this.socket.on(eventName, callback);
    
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  // Listen for chat messages
  onChatMessage(callback) {
    if (!this.socket) {
      this.connect();
    }

    const eventName = 'chat-message';
    this.socket.on(eventName, callback);
    
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  // Listen for typing indicators
  onTypingIndicator(callback) {
    if (!this.socket) {
      this.connect();
    }

    const eventName = 'typing-indicator';
    this.socket.on(eventName, callback);
    
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  // Listen for message sent confirmation
  onMessageSent(callback) {
    if (!this.socket) {
      this.connect();
    }

    const eventName = 'message-sent';
    this.socket.on(eventName, callback);
    
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  // Remove specific event listener
  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
      
      // Remove from listeners map
      if (this.listeners.has(eventName)) {
        const callbacks = this.listeners.get(eventName);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  // Remove all listeners for an event
  offAll(eventName) {
    if (this.socket) {
      this.socket.off(eventName);
      this.listeners.delete(eventName);
    }
  }

  // Emit custom event to server
  emit(eventName, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(eventName, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', eventName);
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Check if socket is connected
  getConnectionStatus() {
    return this.isConnected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
