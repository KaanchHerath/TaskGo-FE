import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaTimes, FaSpinner, FaComments, FaUser, FaMinus, FaExpand } from 'react-icons/fa';
import { getConversation, sendMessage, markMessagesAsRead } from '../../services/api/chatService';

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
      const response = await getConversation(taskId, receiverId);
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

      const messageData = {
        taskId,
        senderId: currentUser.userId,
        receiverId,
        message: newMessage.trim()
      };

      const response = await sendMessage(messageData);
      
      // Add the new message to the conversation
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
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
    return message.senderId._id === currentUser.userId;
  };

  return (
    <>
      {/* Overlay for mobile/smaller screens */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Chat Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white/95 backdrop-blur-xl shadow-2xl border-l border-gray-200/60 z-50 transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } ${isMinimized ? 'h-16' : 'h-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/60 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUser className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{receiverName}</h3>
              <p className="text-sm text-slate-600">Task Chat</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-gray-200/80 rounded-full transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <FaExpand className="text-gray-600" /> : <FaMinus className="text-gray-600" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200/80 rounded-full transition-colors"
              title="Close"
            >
              <FaTimes className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Chat Content - Hidden when minimized */}
        {!isMinimized && (
          <>
            {/* Messages Container */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50/50 to-white/50"
              style={{ height: 'calc(100vh - 140px)' }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FaSpinner className="animate-spin" />
                    <span>Loading conversation...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-red-600">
                    <FaComments className="mx-auto mb-2 text-2xl" />
                    <p>{error}</p>
                    <button
                      onClick={fetchConversation}
                      className="mt-2 text-blue-600 hover:text-blue-800 underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <FaComments className="mx-auto mb-2 text-3xl" />
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
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
                          className={`max-w-xs px-4 py-3 rounded-xl shadow-sm ${
                            isMine
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isMine ? 'text-blue-100' : 'text-gray-500'
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

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200/60 bg-white/80 backdrop-blur-sm">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/90"
                  disabled={sending}
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg flex items-center justify-center"
                >
                  {sending ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaPaperPlane />
                  )}
                </button>
              </form>

              {/* Error Message */}
              {error && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-700 text-sm flex items-center">
                    <span className="mr-2">⚠️</span>
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