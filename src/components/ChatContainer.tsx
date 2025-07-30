'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message, Reminder, ChatResponse } from '@/lib/types';
import { processMessage } from '@/lib/chatbot';

interface ChatContainerProps {
  addReminder: (reminder: Reminder) => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ addReminder }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy Don Mariño, tu asistente para recordatorios. Puedes pedirme que guarde fechas importantes, eventos o tareas pendientes. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    try {
      // Process the message
      const response: ChatResponse = await processMessage(input);
      
      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      
      // If there's a reminder in the response, add it
      if (response.reminder) {
        const newReminder: Reminder = {
          id: Date.now().toString(),
          ...response.reminder,
          completed: false,
          createdAt: Date.now(),
        };
        
        addReminder(newReminder);
        
        // Notify user that reminder was added
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            text: `He creado un recordatorio para "${newReminder.title}" para el ${new Date(newReminder.date).toLocaleDateString()}.`,
            sender: 'bot',
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (error) {
      // Handle error
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.',
          sender: 'bot',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${
              message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'
            }`}
          >
            <p>{message.text}</p>
            <span className="text-xs opacity-70 block text-right">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Escribe tu mensaje aquí..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            className="bg-primary text-white py-2 px-4 rounded-r-md hover:bg-opacity-90 disabled:bg-opacity-50"
            onClick={handleSendMessage}
            disabled={isProcessing || input.trim() === ''}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
            ) : (
              <span>Enviar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
