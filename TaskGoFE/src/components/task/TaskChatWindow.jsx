import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaTimes, FaSpinner, FaComments, FaUser, FaMinus, FaExpand, FaPhone, FaVideo } from 'react-icons/fa';
import { getMessages, sendMessage, markMessagesAsRead } from '../../services/api/chatService';

const TaskChatWindow = ({ taskId, receiverId, receiverName, isOpen, onClose, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

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
      
      // Add the new message to the conversation
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
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
                          <p
                            className={`text-xs mt-1 ${
                              isMine ? 'text-blue-100' : 'text-gray-400'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input - Auto height */}
            <div className="px-4 py-3 border-t border-gray-200/50 bg-white/90 backdrop-blur-sm flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
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