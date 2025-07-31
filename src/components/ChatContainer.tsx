'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Message, Reminder, ChatResponse } from '@/lib/types';
import { processMessage } from '@/lib/chatbot';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';

interface ChatContainerProps {
  addReminder: (reminder: Reminder) => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ addReminder }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
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

  // Estado para controlar cuando mostrar el loading con duración mínima
  const [showLoading, setShowLoading] = useState(loading);
  
  // Efecto para actualizar el estado de showLoading cuando cambia loading
  useEffect(() => {
    if (loading) {
      setShowLoading(true);
    }
  }, [loading]);
  
  // Si está cargando o todavía no ha pasado el tiempo mínimo, mostrar pantalla animada
  if (showLoading) {
    return <LoadingScreen 
      message="Preparando el chat" 
      onLoadingComplete={() => {
        // Solo ocultamos el loading si la autenticación ya terminó
        if (!loading) {
          setShowLoading(false);
        }
      }} 
    />;
  }
  
  // Si no hay usuario autenticado, mostrar mensaje de inicio de sesión
  if (!user) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">Acceso restringido</h3>
              <div className="mt-2 text-yellow-700">
                <p>
                  Para usar el chat de Don Mariño debes iniciar sesión primero.
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={() => router.push('/login')}
                >
                  Iniciar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header personalizado */}
      <div className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark shadow-md flex items-center justify-center">
        <div className="text-white text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="text-primary font-bold text-sm">DM</div>
            </div>
            <h3 className="text-lg font-semibold">Asistente Don Mariño</h3>
          </div>
          <p className="text-xs opacity-80 mt-1">Estoy aquí para ayudarte con tus recordatorios</p>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 px-4 py-6 overflow-y-auto" style={{ backgroundImage: "url('/chat-bg-pattern.png')", backgroundSize: '300px' }}>
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div 
                className={`relative max-w-[80%] px-4 py-3 rounded-xl shadow-sm ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                } animate-scale-in`}
                style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
              >
                {message.sender === 'bot' && (
                  <div className="absolute -left-2 -top-2 w-6 h-6 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm">
                    <div className="text-primary font-bold text-xs">DM</div>
                  </div>
                )}
                
                <div className="prose prose-sm">
                  {message.text.split('\n').map((line, i) => (
                    <p key={i} className="mb-1 last:mb-0">{line}</p>
                  ))}
                </div>
                
                <div className={`text-xs mt-1 flex items-center ${message.sender === 'user' ? 'text-blue-100 justify-end' : 'text-gray-400'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                  {message.sender === 'user' && (
                    <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                
                {message.sender === 'bot' && (
                  <div className="absolute left-0 top-0 transform -translate-x-full translate-y-1/2">
                    <div className="w-2 h-2 bg-white rotate-45 transform -translate-x-1/2 border-l border-t border-gray-200"></div>
                  </div>
                )}
                
                {message.sender === 'user' && (
                  <div className="absolute right-0 top-0 transform translate-x-full translate-y-1/2">
                    <div className="w-2 h-2 bg-primary rotate-45 transform translate-x-1/2"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white rounded-xl px-4 py-3 text-gray-500 flex items-center space-x-2 border border-gray-200 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm">Don Mariño está escribiendo</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 shadow-inner">
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center bg-gray-50 rounded-full border border-gray-300 transition-all focus-within:ring-2 focus-within:ring-primary focus-within:border-primary overflow-hidden pr-1">
            <input
              type="text"
              className="flex-1 py-3 pl-5 pr-2 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
              placeholder="Escribe tu mensaje aquí..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isProcessing && input.trim() !== '' && handleSendMessage()}
              disabled={isProcessing}
            />
            
            <button
              className={`flex items-center justify-center h-10 w-10 rounded-full mr-1 transition-all ${isProcessing || input.trim() === '' ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark'}`}
              onClick={handleSendMessage}
              disabled={isProcessing || input.trim() === ''}
              aria-label="Enviar mensaje"
            >
              {isProcessing ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="mt-1 text-xs text-center text-gray-400">
            Puedes pedirme que guarde recordatorios, eventos importantes o tareas pendientes
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
