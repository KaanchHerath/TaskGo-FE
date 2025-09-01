import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaTimes, FaSpinner, FaComments, FaUser, FaMinus, FaExpand, FaPhone, FaVideo } from 'react-icons/fa';
import { getMessages, sendMessage, markMessagesAsRead } from '../../services/api/chatService';
import socketService from '../../services/api/socketService';
import audioManager from '../../utils/audioUtils';

const TaskChatWindow = ({ taskId, receiverId, receiverName, isOpen, onClose, currentUser, task }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation when component mounts or taskId/receiverId changes
  useEffect(() => {
    if (isOpen && taskId && receiverId) {
      fetchConversation();
      markAsRead();
    }
  }, [isOpen, taskId, receiverId]);

  // Setup WebSocket listeners for real-time messaging
  useEffect(() => {
    console.log('🔌 Setting up WebSocket listeners:', { isOpen, taskId, receiverId });
    
    if (!isOpen || !taskId || !receiverId) {
      console.log('❌ Cannot setup WebSocket listeners - missing required data');
      return;
    }

    // Listen for incoming chat messages
    const handleChatMessage = (data) => {
      console.log('🔔 Real-time chat message received:', data);
      
      // Check if this message is for the current task
      if (data.taskId === taskId) {
        console.log('✅ Message matches current task, updating conversation');
        
        // Add the new message to the conversation
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const messageExists = prev.some(msg => msg._id === data.message._id);
          if (messageExists) {
            console.log('⚠️ Message already exists, skipping duplicate');
            return prev;
          }
          
          console.log('➕ Adding new message to conversation:', data.message);
          return [...prev, data.message];
        });
        
        // Auto-scroll to bottom for new messages
        setTimeout(scrollToBottom, 100);
        
        // Play notification sound for incoming messages (only if from other user)
        const currentUserId = currentUser?.userId || currentUser?._id;
        if (data.senderId !== currentUserId) {
          audioManager.playMessageSound();
          markAsRead();
        }
      } else {
        console.log('❌ Message does not match current task:', {
          messageTaskId: data.taskId,
          currentTaskId: taskId
        });
      }
    };

    // Listen for message sent confirmation
    const handleMessageSent = (data) => {
      console.log('✅ Message sent confirmation received:', data);
      
      // Update the message status if needed
      if (data.taskId === taskId) {
        // Message was successfully sent and stored
        // The message should already be in the local state
      }
    };

    // Listen for typing indicators
    const handleTypingIndicator = (data) => {
      console.log('⌨️ Typing indicator received:', data);
      
      if (data.taskId === taskId && data.senderId === receiverId) {
        console.log('✅ Typing indicator matches current chat, updating state');
        setIsTyping(data.isTyping);
      } else {
        console.log('❌ Typing indicator does not match current chat:', {
          indicatorTaskId: data.taskId,
          currentTaskId: taskId,
          indicatorSenderId: data.senderId,
          currentReceiverId: receiverId
        });
      }
    };

    // Setup socket listeners
    console.log('🔌 Setting up socket listeners for chat');
    socketService.onChatMessage(handleChatMessage);
    socketService.onMessageSent(handleMessageSent);
    socketService.onTypingIndicator(handleTypingIndicator);
    
    // Ensure socket is connected
    if (!socketService.getConnectionStatus()) {
      console.log('🔌 Socket not connected, attempting to connect...');
      socketService.connect();
    } else {
      console.log('✅ Socket already connected');
    }

    // Cleanup socket listeners
    return () => {
      socketService.off('chat-message', handleChatMessage);
      socketService.off('message-sent', handleMessageSent);
      socketService.off('typing-indicator', handleTypingIndicator);
    };
  }, [isOpen, taskId, receiverId]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMessages(taskId, receiverId);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setError('Failed to load conversation. Please try again.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await markMessagesAsRead(taskId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Send typing indicator
    if (value.trim()) {
      socketService.emit('typing-indicator', {
        taskId,
        senderId: currentUser?.userId || currentUser?._id,
        receiverId,
        isTyping: true
      });
    }
    
    // Set timeout to stop typing indicator
    const timeout = setTimeout(() => {
      socketService.emit('typing-indicator', {
        taskId,
        senderId: currentUser?.userId || currentUser?._id,
        receiverId,
        isTyping: false
      });
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Stop typing indicator
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    socketService.emit('typing-indicator', {
      taskId,
      senderId: currentUser?.userId || currentUser?._id,
      receiverId,
      isTyping: false
    });

    try {
      setSending(true);
      setError(null);

      // Debug logging to check all values
      console.log('🔍 Chat Debug:', {
        taskId,
        currentUser,
        receiverId,
        message: newMessage.trim()
      });

      // Get the correct user ID from currentUser
      const senderId = currentUser?.userId || currentUser?._id;
      
      // Validate all required fields
      if (!taskId || !senderId || !receiverId || !newMessage.trim()) {
        const missingFields = [];
        if (!taskId) missingFields.push('taskId');
        if (!senderId) missingFields.push('senderId');
        if (!receiverId) missingFields.push('receiverId');
        if (!newMessage.trim()) missingFields.push('message');
        
        console.error('Missing required fields:', missingFields);
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      const messageData = {
        taskId,
        senderId,
        receiverId,
        message: newMessage.trim()
      };

      console.log('📤 Sending message:', messageData);

      const response = await sendMessage(messageData);
      
      // Add the new message to the conversation immediately for better UX
      const newMessageObj = response.data;
      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage('');
      
      // Auto-scroll to bottom for the new message
      setTimeout(scrollToBottom, 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
  };

  const isMyMessage = (message) => {
    const myUserId = currentUser?.userId || currentUser?._id;
    return message.senderId._id === myUserId;
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay only - no desktop overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 sm:hidden"
        onClick={onClose}
      />

      {/* Floating Chat Window - Positioned to stay fully visible */}
      <div 
        className={`fixed bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200/50 z-50 rounded-2xl overflow-hidden transition-all duration-300 ease-out ${
          isMinimized 
            ? 'bottom-4 right-4 w-80' 
            : 'bottom-4 right-4 w-96'
        }`}
        style={{ 
          height: isMinimized ? 'auto' : 'min(80vh, 500px)',
          maxHeight: 'calc(100vh - 8rem)',
          minHeight: isMinimized ? 'auto' : '300px',
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header - Auto height */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 flex-shrink-0">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FaUser className="text-white text-xs" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-800 text-sm leading-tight truncate">{receiverName}</h3>
              <p className="text-xs text-slate-500 leading-tight">Task Chat</p>
            </div>
          </div>
          
          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-2 mr-2">
            <div className={`w-2 h-2 rounded-full ${
              socketService.getConnectionStatus() ? 'bg-green-400' : 'bg-red-400'
            }`} title={socketService.getConnectionStatus() ? 'Connected' : 'Disconnected'}></div>
            <button
              onClick={() => socketService.connect()}
              className="text-xs text-slate-600 hover:text-slate-800 transition-colors p-1 hover:bg-gray-200/80 rounded"
              title="Reconnect"
            >
              ↻
            </button>
            
            {/* Sound Toggle */}
            <button
              onClick={() => audioManager.setSoundEnabled(!audioManager.isEnabled)}
              className={`text-xs p-1 hover:bg-gray-200/80 rounded transition-colors ${
                audioManager.isEnabled ? 'text-slate-600' : 'text-slate-400'
              }`}
              title={audioManager.isEnabled ? 'Sound On' : 'Sound Off'}
            >
              {audioManager.isEnabled ? '🔊' : '🔇'}
            </button>
          </div>
          
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-gray-200/80 rounded-md transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <FaExpand className="text-gray-600 text-xs" /> : <FaMinus className="text-gray-600 text-xs" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200/80 rounded-md transition-colors"
              title="Close"
            >
              <FaTimes className="text-gray-600 text-xs" />
            </button>
          </div>
        </div>

        {/* Chat Content - Hidden when minimized */}
        {!isMinimized && (
          <>
            {/* Messages Container - Flexible height */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-gray-50/30 to-white/30 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
              style={{ 
                minHeight: 0,
                flex: '1 1 0%'
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FaSpinner className="animate-spin text-base" />
                    <span className="text-sm">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                  <div className="text-center text-red-600">
                    <FaComments className="mx-auto mb-2 text-xl" />
                    <p className="text-sm">{error}</p>
                    <button
                      onClick={fetchConversation}
                      className="mt-2 text-blue-600 hover:text-blue-800 underline text-xs"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                  <div className="text-center text-gray-500">
                    <FaComments className="mx-auto mb-2 text-2xl" />
                    <p className="font-medium text-sm">No messages yet</p>
                    <p className="text-xs">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isMine = isMyMessage(message);
                    return (
                      <div
                        key={message._id || index}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm ${
                            isMine
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                              : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words">{message.message}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p
                              className={`text-xs ${
                                isMine ? 'text-blue-100' : 'text-gray-400'
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                            
                            {/* Message Status Indicator (for sent messages) */}
                            {isMine && (
                              <div className="flex items-center space-x-1">
                                <div className={`w-3 h-3 ${
                                  message.isRead ? 'text-green-300' : 'text-blue-200'
                                }`}>
                                  {message.isRead ? '✓✓' : '✓'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-2xl text-sm">
                        <div className="flex items-center space-x-1">
                          <span>{receiverName} is typing</span>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Message Input - Auto height */}
            <div className="px-4 py-3 border-t border-gray-200/50 bg-white/90 backdrop-blur-sm flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type message..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300/70 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors bg-white/90 placeholder-gray-400"
                  disabled={sending}
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center justify-center w-10"
                >
                  {sending ? (
                    <FaSpinner className="animate-spin text-xs" />
                  ) : (
                    <FaPaperPlane className="text-xs" />
                  )}
                </button>
              </form>

              {/* Error Message */}
              {error && (
                <div className="mt-2 bg-red-50/80 border border-red-200/80 rounded-md p-2">
                  <p className="text-red-700 text-xs flex items-center">
                    <span className="mr-1">⚠️</span>
                    {error}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default TaskChatWindow; 