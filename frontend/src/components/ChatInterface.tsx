import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isConnected: boolean;
  isLoading?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isConnected,
  isLoading = false
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg hover-lift animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bot className="w-7 h-7 text-primary-600 animate-bounce-in" />
            {isConnected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse-glow"></div>
            )}
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 animate-slide-up">
            AI Task Assistant
          </h2>
        </div>
        <div className="flex items-center space-x-2 animate-slide-down">
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
            isConnected 
              ? 'bg-green-500 animate-connection-pulse shadow-lg shadow-green-500/50' 
              : 'bg-red-500 animate-pulse'
          }`} />
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="text-center py-8 animate-fade-in">
            <div className="relative mb-6">
              <Bot className="w-16 h-16 text-primary-400 mx-auto animate-bounce-in" />
              <div className="absolute inset-0 bg-primary-200 dark:bg-primary-800 rounded-full blur-xl opacity-30 animate-pulse-glow"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 animate-slide-up">
              Welcome to AI Task Management
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 animate-slide-up">
              I can help you manage your tasks through natural language. Try saying:
            </p>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 animate-slide-up">
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm hover-lift cursor-pointer">
                <p className="font-medium">"Create a task to buy milk tomorrow"</p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm hover-lift cursor-pointer">
                <p className="font-medium">"Show me all high priority tasks"</p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm hover-lift cursor-pointer">
                <p className="font-medium">"Mark the meeting task as completed"</p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm hover-lift cursor-pointer">
                <p className="font-medium">"Delete the old task about groceries"</p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-appear`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                  message.role === 'user' 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 shadow-md'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className={`rounded-lg px-4 py-2 transition-all duration-300 hover:shadow-md ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap animate-typing">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user'
                      ? 'text-primary-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start animate-slide-up">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-blue-500 flex items-center justify-center animate-pulse-glow">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    AI is thinking<span className="loading-dots"></span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to create, update, or manage your tasks..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-all duration-300 hover:shadow-md focus:shadow-lg"
              disabled={isLoading || !isConnected}
            />
            {isConnected && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || !isConnected}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl hover:from-primary-700 hover:to-blue-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 animate-button-press"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Sending</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span className="text-sm font-medium">Send</span>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
